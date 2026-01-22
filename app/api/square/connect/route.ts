import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
        return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const SQUARE_ENV = process.env.SQUARE_ENV || "sandbox";
    const SQUARE_APP_ID = process.env.SQUARE_APP_ID;
    const REDIRECT_URI = SQUARE_ENV === "production"
        ? process.env.SQUARE_PROD_REDIRECT_URI
        : process.env.SQUARE_SANDBOX_REDIRECT_URI;

    if (!SQUARE_APP_ID || !REDIRECT_URI) {
        return NextResponse.json({ error: "Square configuration missing" }, { status: 500 });
    }

    const supabase = createAdminClient();

    // 1. Generate cryptographically-random state
    const state = crypto.randomUUID();

    // 2. Store state in Supabase linked to the org
    const { error } = await supabase
        .from("square_oauth_states")
        .insert({
            org_id: orgId,
            state: state
        });

    if (error) {
        console.error("Error storing Square OAuth state:", error);
        return NextResponse.json({ error: "Failed to initialize connection" }, { status: 500 });
    }

    // 3. Build the authorize URL
    const scopes = ["PAYMENTS_WRITE", "PAYMENTS_READ", "PAYMENTS_WRITE_ADDITIONAL_RECIPIENTS"].join(" ");

    const baseUrl = SQUARE_ENV === "production"
        ? "https://connect.squareup.com/oauth2/authorize"
        : "https://connect.squareupsandbox.com/oauth2/authorize";

    const params = new URLSearchParams({
        client_id: SQUARE_APP_ID,
        response_type: "code",
        scope: scopes,
        state: state,
        redirect_uri: REDIRECT_URI
    });

    return NextResponse.redirect(`${baseUrl}?${params.toString()}`);
}
