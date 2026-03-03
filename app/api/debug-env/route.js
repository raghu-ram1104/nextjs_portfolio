import { NextResponse } from 'next/server'

export async function GET() {
  const envKeys = Object.keys(process.env).filter(
    (k) => k.includes('SUPABASE') || k.includes('NEXT_PUBLIC_SUPABASE')
  )

  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServerUrl: !!process.env.SUPABASE_URL,
    hasServerKey: !!process.env.SUPABASE_ANON_KEY,
    relevantEnvKeys: envKeys,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'NOT SET',
  })
}
