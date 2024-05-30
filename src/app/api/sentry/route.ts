import { NextResponse } from 'next/server'

export function GET(): NextResponse {
  throw new Error('Erreur explicite du backend')
}
