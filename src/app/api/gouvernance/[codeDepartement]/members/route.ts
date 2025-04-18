import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { PrismaMesMembresLoader } from '@/gateways/PrismaMesMembresLoader'
import { MembresGouvernancesViewModel, toActionViewModel } from '@/presenters/membresGouvernancesPresenter'
import { RecupererMesMembres } from '@/use-cases/queries/RecupererMesMembres'

// @ts-ignore : req doit être déclaré pour le fonctionnement
export async function GET(req: NextRequest, context: { params: { codeDepartement: string } })
  : Promise<NextResponse<{ error: string } | Array<MembresGouvernancesViewModel> |null>>{
  const cookieStore = await cookies()
  if (!cookieStore.has('next-auth.session-token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = await Promise.resolve(context.params)
  const codeDepartement = params.codeDepartement
  const result = await new RecupererMesMembres(new PrismaMesMembresLoader()).handle({
    codeDepartement,
  })

  return NextResponse.json(toActionViewModel(result.membres))
}

