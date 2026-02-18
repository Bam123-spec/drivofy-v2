import { createServer } from "node:http"
import { once } from "node:events"
import type { AddressInfo } from "node:net"
import { createStudentViaCentralOnboarding } from "../lib/onboarding-core"

type CaseResult = {
    id: string
    pass: boolean
    details: string
}

async function main() {
    let existingHits = 0

    const mockServer = createServer(async (req, res) => {
        if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "method_not_allowed" }))
            return
        }

        if (req.url === "/api/admin/students/create/success") {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ userId: "usr_test_new_123" }))
            return
        }

        if (req.url === "/api/admin/students/create/existing") {
            existingHits += 1
            res.writeHead(409, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "user already exists" }))
            return
        }

        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "not_found" }))
    })

    mockServer.listen(0, "127.0.0.1")
    await once(mockServer, "listening")
    const mockPort = (mockServer.address() as AddressInfo).port
    const mockBaseUrl = `http://127.0.0.1:${mockPort}`

    const results: CaseResult[] = []

    // Test A: brand new student
    const testA = await createStudentViaCentralOnboarding(
        {
            email: "new.student@example.com",
            fullName: "New Student",
            phone: "555-111-2222",
            source: "admin_portal",
        },
        {
            onboardingUrl: `${mockBaseUrl}/api/admin/students/create/success`,
            onboardingKey: "test-key",
            requestId: "test-A",
        }
    )
    results.push({
        id: "A",
        pass: testA.success && testA.message === "Student created. Magic link email sent.",
        details: `success=${testA.success} message="${testA.message}" userId="${testA.userId || ""}"`,
    })

    // Test B: existing email conflict
    const testB = await createStudentViaCentralOnboarding(
        {
            email: "existing.student@example.com",
            fullName: "Existing Student",
            source: "admin_portal",
        },
        {
            onboardingUrl: `${mockBaseUrl}/api/admin/students/create/existing`,
            onboardingKey: "test-key",
            requestId: "test-B",
        }
    )
    results.push({
        id: "B",
        pass: !testB.success && testB.message.includes("already exists") && existingHits === 1,
        details: `success=${testB.success} status=${testB.statusCode} message="${testB.message}"`,
    })

    // Test C: invalid email
    const testC = await createStudentViaCentralOnboarding(
        {
            email: "invalid-email",
            fullName: "Invalid Email",
            source: "admin_portal",
        },
        {
            onboardingUrl: `${mockBaseUrl}/api/admin/students/create/success`,
            onboardingKey: "test-key",
            requestId: "test-C",
        }
    )
    results.push({
        id: "C",
        pass: !testC.success && testC.statusCode === 400 && testC.message.includes("valid email"),
        details: `success=${testC.success} status=${testC.statusCode} message="${testC.message}"`,
    })

    // Test D: missing onboarding key
    const testD = await createStudentViaCentralOnboarding(
        {
            email: "missing.key@example.com",
            fullName: "Missing Key",
            source: "admin_portal",
        },
        {
            onboardingUrl: `${mockBaseUrl}/api/admin/students/create/success`,
            onboardingKey: "",
            requestId: "test-D",
        }
    )
    results.push({
        id: "D",
        pass: !testD.success && testD.message.includes("not configured"),
        details: `success=${testD.success} status=${testD.statusCode} message="${testD.message}"`,
    })

    // Test E: onboarding URL down, retry should occur once
    const deadServer = createServer()
    deadServer.listen(0, "127.0.0.1")
    await once(deadServer, "listening")
    const deadPort = (deadServer.address() as AddressInfo).port
    await new Promise<void>((resolve) => deadServer.close(() => resolve()))

    const testEEvents: string[] = []
    const testE = await createStudentViaCentralOnboarding(
        {
            email: "url.down@example.com",
            fullName: "URL Down",
            source: "admin_portal",
        },
        {
            onboardingUrl: `http://127.0.0.1:${deadPort}/api/admin/students/create`,
            onboardingKey: "test-key",
            requestId: "test-E",
            onEvent: (event) => testEEvents.push(event),
        }
    )
    results.push({
        id: "E",
        pass: !testE.success
            && testE.message.includes("temporarily unavailable")
            && testEEvents.filter((event) => event === "attempt_retry").length === 1,
        details: `success=${testE.success} status=${testE.statusCode} retries=${testEEvents.filter((event) => event === "attempt_retry").length} message="${testE.message}"`,
    })

    await new Promise<void>((resolve) => mockServer.close(() => resolve()))

    const passed = results.filter((result) => result.pass).length
    console.log("\nAdmin onboarding migration test results")
    for (const result of results) {
        console.log(`${result.pass ? "PASS" : "FAIL"} [${result.id}] ${result.details}`)
    }
    console.log(`\nSummary: ${passed}/${results.length} passed`)

    if (passed !== results.length) {
        process.exitCode = 1
    }
}

main().catch((error) => {
    console.error("Test runner failed:", error)
    process.exit(1)
})
