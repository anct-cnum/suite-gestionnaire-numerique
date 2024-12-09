import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Gouvernance from '@/components/Gouvernance/Gouvernance'

export const metadata: Metadata = {
  title: 'Gouvernance vide',
}

export default async function GouvernanceVideController({ params }: PageProps): Promise<ReactElement> {
  if (!(await params).codeDepartement) {
    notFound()
  }

  const gouvernanceViewModel = {
    departement: 'Rhône',
    isVide: true,
    sectionFeuillesDeRoute: {
      budgetTotalCumule: '',
      lien: {
        label: '',
        url: new URL('/', process.env.NEXT_PUBLIC_HOST).toString(),
      },
      total: '',
      wording: '',
    },
    sectionMembres: {
      detailDuNombreDeChaqueMembre: '',
      total: '',
      wording: '',
    },
    sectionNoteDeContexte: {
      sousTitre: '',
    },
  }

  return (
    <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
  )
}

type PageProps = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
