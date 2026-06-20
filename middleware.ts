import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth middleware — currently passes all requests through.
// Once Supabase is connected, swap this for a real session check.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
