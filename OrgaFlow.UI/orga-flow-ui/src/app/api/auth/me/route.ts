// app/api/auth/me/route.ts
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('AuthToken')?.value

    if (!token) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
    }

    try {
        const decoded: any = jwt.decode(token)
        const userId = decoded?.sub

        if (!userId) {
            return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
        }

        return new Response(JSON.stringify({
            authenticated: true,
            userId: decoded.sub,
            name: decoded.unique_name || "",
            exp: decoded.exp,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        })

    } catch (err) {
        return new Response(JSON.stringify({ authenticated: false }), { status: 401 })
    }
}
