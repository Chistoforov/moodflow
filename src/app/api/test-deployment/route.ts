import { NextResponse } from 'next/server'

/**
 * Simple test endpoint to verify deployment
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'NEW CODE IS DEPLOYED',
    version: 'deployment-test-v1',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'ok',
    message: 'NEW CODE IS DEPLOYED - POST',
    version: 'deployment-test-v1',
    timestamp: new Date().toISOString()
  })
}

