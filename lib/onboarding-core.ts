
export type CentralOnboardingInput = {
    email: string
    fullName: string
    phone?: string
    source?: "admin_portal"
}

export type CentralOnboardingResult = {
    success: boolean
    message: string
    userId?: string
    requestId: string
    statusCode?: number
}

type NormalizedInput = {
    email: string
    fullName: string
    phone?: string
    source: "admin_portal"
}

const ONBOARDING_TIMEOUT_MS = 10_000
const MAX_ATTEMPTS = 2

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function maskEmail(email: string) {
    const [local = "", domain = ""] = email.split("@")
    if (!domain) return "***"
    return `${local.slice(0, 2)}***@${domain}`
}

function safeHost(url: string) {
    try {
        return new URL(url).host
    } catch {
        return "invalid-url"
    }
}

function normalizeInput(input: CentralOnboardingInput): { ok: true; value: NormalizedInput } | { ok: false; message: string } {
    const email = String(input?.email || "").trim().toLowerCase()
    const fullName = String(input?.fullName || "").trim()
    const phone = String(input?.phone || "").trim()
    const source = "admin_portal" as const

    if (!email || !isValidEmail(email)) {
        return { ok: false, message: "A valid email is required." }
    }
    if (!fullName) {
        return { ok: false, message: "Full name is required." }
    }

    return {
        ok: true,
        value: {
            email,
            fullName,
            phone: phone || undefined,
            source,
        },
    }
}

function isCloudflareChallenge(text: string) {
    return text.includes("/cdn-cgi/challenge-platform")
        || text.includes("__cf_chl_")
        || text.includes("cf-challenge")
}

function mapFriendlyMessage(statusCode: number, cloudflareBlocked: boolean) {
    if (cloudflareBlocked) {
        return "Onboarding API is blocked by Cloudflare challenge. Disable JS challenge for this endpoint."
    }
    if (statusCode === 400) {
        return "Invalid student input. Check email and full name."
    }
    if (statusCode === 401 || statusCode === 403) {
        return "Onboarding authentication is misconfigured. Please contact support."
    }
    if (statusCode === 409) {
        return "Student already exists. Ask them to log in or reset password."
    }
    if (statusCode >= 500) {
        return "Onboarding service is temporarily unavailable. Please retry."
    }
    return "Unable to create student right now. Please retry."
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timeout)
    }
}

export async function createStudentViaCentralOnboarding(
    input: CentralOnboardingInput,
    options?: {
        onboardingUrl?: string
        onboardingKey?: string
        requestId?: string
        onEvent?: (event: string, payload: Record<string, unknown>) => void
    }
): Promise<CentralOnboardingResult> {
    const emit = (level: "info" | "warn" | "error", event: string, payload: Record<string, unknown>) => {
        console[level](`[onboarding] ${event}`, payload)
        options?.onEvent?.(event, payload)
    }

    const requestId = options?.requestId || crypto.randomUUID()
    const normalized = normalizeInput(input)
    if (!normalized.ok) {
        return {
            success: false,
            message: normalized.message,
            requestId,
            statusCode: 400,
        }
    }

    const onboardingUrl = options?.onboardingUrl || process.env.SELAM_ONBOARDING_URL
    const onboardingKey = options?.onboardingKey || process.env.SELAM_ONBOARDING_KEY

    if (!onboardingUrl || !onboardingKey) {
        emit("error", "config_missing", {
            requestId,
            hasUrl: Boolean(onboardingUrl),
            hasKey: Boolean(onboardingKey),
        })
        return {
            success: false,
            message: "Onboarding service is not configured.",
            requestId,
            statusCode: 500,
        }
    }

    const payload = normalized.value
    let lastStatusCode: number | undefined = undefined

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        emit("info", "attempt_start", {
            requestId,
            attempt,
            endpointHost: safeHost(onboardingUrl),
            source: payload.source,
            email: maskEmail(payload.email),
        })

        try {
            const response = await fetchWithTimeout(
                onboardingUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-admin-key": onboardingKey,
                    },
                    body: JSON.stringify(payload),
                    cache: "no-store",
                },
                ONBOARDING_TIMEOUT_MS
            )

            lastStatusCode = response.status
            const rawBody = await response.text()
            let responseJson: any = {}
            try {
                responseJson = rawBody ? JSON.parse(rawBody) : {}
            } catch {
                responseJson = {}
            }

            emit("info", "response_status", {
                requestId,
                attempt,
                statusCode: response.status,
            })

            if (response.ok) {
                const userId = responseJson?.userId || responseJson?.user?.id || responseJson?.id || undefined
                emit("info", "success", {
                    requestId,
                    attempt,
                    statusCode: response.status,
                    hasUserId: Boolean(userId),
                })
                return {
                    success: true,
                    message: "Student created. Magic link email sent.",
                    userId,
                    requestId,
                    statusCode: response.status,
                }
            }

            const backendError = responseJson?.error || rawBody || "unknown_error"
            const cloudflareBlocked = isCloudflareChallenge(rawBody)
            emit("warn", "failure", {
                requestId,
                attempt,
                statusCode: response.status,
                reason: cloudflareBlocked ? "cloudflare_challenge" : "http_error",
                backendError: String(backendError).slice(0, 500),
            })

            const shouldRetry = response.status >= 500 && attempt < MAX_ATTEMPTS
            if (shouldRetry) {
                emit("info", "attempt_retry", {
                    requestId,
                    nextAttempt: attempt + 1,
                    reason: `http_${response.status}`,
                })
                continue
            }

            return {
                success: false,
                message: mapFriendlyMessage(response.status, cloudflareBlocked),
                requestId,
                statusCode: response.status,
            }
        } catch (error: any) {
            const isAbort = error?.name === "AbortError"
            const reason = isAbort ? "timeout" : "network_error"
            emit("error", "failure", {
                requestId,
                attempt,
                reason,
                errorMessage: error?.message || "unknown_error",
            })

            if (attempt < MAX_ATTEMPTS) {
                emit("info", "attempt_retry", {
                    requestId,
                    nextAttempt: attempt + 1,
                    reason,
                })
                continue
            }

            return {
                success: false,
                message: "Onboarding service is temporarily unavailable. Please retry.",
                requestId,
                statusCode: lastStatusCode || 503,
            }
        }
    }

    return {
        success: false,
        message: "Onboarding service is temporarily unavailable. Please retry.",
        requestId,
        statusCode: lastStatusCode || 503,
    }
}
