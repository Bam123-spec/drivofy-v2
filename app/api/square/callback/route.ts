import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        console.error("Square OAuth Error:", error, searchParams.get("error_description"));
        return NextResponse.redirect(new URL("/admin/settings/payments?error=square_denied", request.url));
    }

    if (!code || !state) {
        return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Validate state and get orgId
    const { data: stateRecord, error: stateError } = await supabase
        .from("square_oauth_states")
        .select("org_id")
        .eq("state", state)
        .single();

    if (stateError || !stateRecord) {
        console.error("Invalid state provided by Square callback", stateError);
        return NextResponse.redirect(new URL("/admin/settings/payments?error=invalid_state", request.url));
    }

    const orgId = stateRecord.org_id;

    // 2. Exchange code for tokens
    const SQUARE_ENV = process.env.SQUARE_ENV || "sandbox";
    const SQUARE_APP_ID = process.env.SQUARE_APP_ID;
    const SQUARE_APP_SECRET = process.env.SQUARE_APP_SECRET;
    const REDIRECT_URI = SQUARE_ENV === "production"
        ? process.env.SQUARE_PROD_REDIRECT_URI
        : process.env.SQUARE_SANDBOX_REDIRECT_URI;

    const tokenBaseUrl = SQUARE_ENV === "production"
        ? "https://connect.squareup.com/oauth2/token"
        : "https://connect.squareupsandbox.com/oauth2/token";

    try {
        const tokenResponse = await fetch(tokenBaseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Square-Version": "2024-01-18" // Use a stable version
            },
            body: JSON.stringify({
                client_id: SQUARE_APP_ID,
                client_secret: SQUARE_APP_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI
            })
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error("Square token exchange failed:", tokens);
            throw new Error("Token exchange failed");
        }

        // 3. Store tokens and update organization
        const { error: updateError } = await supabase
            .from("organizations")
            .update({
                square_connected: true,
                square_access_token: tokens.access_token,
                square_refresh_token: tokens.refresh_token,
                square_merchant_id: tokens.merchant_id,
                square_token_expires_at: tokens.expires_at,
                updated_at: new Date().toISOString()
            })
            .eq("id", orgId);

        if (updateError) throw updateError;

        // 4. Delete used state
        await supabase.from("square_oauth_states").delete().eq("state", state);

        return NextResponse.redirect(new URL("/admin/settings/payments?connected=1", request.url));

    } catch (e) {
        console.error("Exception during Square callback handling:", e);
        return NextResponse.redirect(new URL("/admin/settings/payments?error=callback_failed", request.url));
    }
}
