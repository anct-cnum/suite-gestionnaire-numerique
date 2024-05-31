import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(): NextResponse {
  throw new Error('Erreur explicite du backend')
}
