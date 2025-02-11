import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import MesFeuillesDeRoute from '@/components/MesFeuillesDeRoute/MesFeuillesDeRoute'

export const metadata: Metadata = {
  title: 'Feuilles de route',
}

export default async function FeuillesDeRouteController({ params }: Props): Promise<ReactElement> {
  if (!(await params).codeDepartement) {
    notFound()
  }

  return (
    <MesFeuillesDeRoute gouvernanceViewModel={{
      comiteARemplir: {
        commentaire: '',
        date: '',
        derniereEdition: '',
        editeur: '',
        frequences: [],
        types: [],
        uid: 1,
      },
      dateAujourdhui: '',
      departement: '',
      isVide: false,
      sectionCoporteurs: {
        coporteurs: [],
        detailDuNombreDeChaqueMembre: '',
        total: '',
        wording: '',
      },
      sectionFeuillesDeRoute: {
        budgetTotalCumule: '',
        feuillesDeRoute: [],
        lien: {
          label: '',
          url: '',
        },
        total: '1',
        wording: '',
      },
      sectionNoteDeContexte: {
        noteDeContexte: {
          dateDeModification: '',
          nomAuteur: '',
          prenomAuteur: '',
          texteAvecHTML: '',
        },
        sousTitre: '',
      },
      uid: '',
    }}
    />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
