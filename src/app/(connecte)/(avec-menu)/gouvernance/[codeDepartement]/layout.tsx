'use server'

import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import GouvernanceProvider from '@/components/shared/GouvernanceContext'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { SousMenuGouvernance } from '@/components/transverse/MenuLateral/SousMenuGouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function Layout({
  children,
  params,
}: {
  readonly children: React.ReactNode
  readonly params: { codeDepartement: string }
}): Promise<ReactElement> {
  try {
    // eslint-disable-next-line sonarjs/no-invalid-await, @typescript-eslint/await-thenable
    const codeDepartement = (await params).codeDepartement
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)
    const gouvernanceReadModel = await new RecupererUneGouvernance(gouvernanceLoader).handle({ codeDepartement })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())
    return (
      <GouvernanceProvider gouvernanceViewModel={gouvernanceViewModel}>
        <div className="fr-grid-row">
          <div className="fr-col-2">
            <MenuLateral
              gouvernanceSousMenu={
                <SousMenuGouvernance
                  codeDepartement={codeDepartement}
                  gouvernanceViewModel={gouvernanceViewModel}
                />
              }
            />
          </div>
          <div className="fr-col-9 fr-pl-7w menu-border">
            {children}
          </div>
        </div>
      </GouvernanceProvider>
    )
  } catch {
    notFound()
  }
}
