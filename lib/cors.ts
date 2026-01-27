export function withCors(res: Response) {
    res.headers.set("Access-Control-Allow-Origin", "https://portifol.com")
    res.headers.set("Access-Control-Allow-Credentials", "true")
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return res
}

export function handleOptions() {
    return withCors(new Response(null, { status: 204 }))
}
