import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeStructuresAdministratives from '@/components/ListeStructuresAdministratives/ListeStructuresAdministratives'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresAdministrativesLoader } from '@/gateways/PrismaStructuresAdministrativesLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeStructuresAdministrativesPresenter } from '@/presenters/listeStructuresAdministrativesPresenter'
import config from '@/use-cases/config.json'
import { ColonneTriable } from '@/use-cases/queries/RecupererStructuresAdministratives'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Liste des structures administratives',
}

export default async function ListeStructuresAdministrativesController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    adresse?: string
    aidantsConnect?: string
    commune?: string
    coop?: string
    departement?: string
    gouvernance?: string
    idposte?: string
    nom?: string
    ordre?: string
    page?: string
    ridet?: string
    rna?: string
    siret?: string
    tri?: string
    type?: string
  }>
}): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(await getSessionSub())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  if (!contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const {
    adresse,
    aidantsConnect,
    commune,
    coop,
    departement,
    gouvernance,
    idposte,
    nom,
    ordre,
    page,
    ridet,
    rna,
    siret,
    tri,
    type,
  } = await searchParams
  const filtreAdresse = adresse === 'avec' || adresse === 'sans' ? adresse : undefined
  const filtreType = type === 'antenne' || type === 'canonique' ? type : undefined
  const filtreGouvernance = gouvernance === 'gouvernance' || gouvernance === 'horsGouvernance' ? gouvernance : undefined
  const colonneTri = colonnesTriables.find((colonne) => colonne === tri)
  const ordreTri: 'asc' | 'desc' | undefined = ordre === 'asc' || ordre === 'desc' ? ordre : undefined
  const filtreTri =
    colonneTri !== undefined && ordreTri !== undefined ? { colonne: colonneTri, ordre: ordreTri } : undefined

  const readModel = await new PrismaStructuresAdministrativesLoader().getStructures({
    adresse: filtreAdresse,
    aidantsConnect,
    commune,
    coop,
    departement,
    gouvernance: filtreGouvernance,
    idposte,
    nom,
    pagination: {
      limite: config.utilisateursParPage,
      page: Number(page ?? '1') - 1,
    },
    ridet,
    rna,
    siret,
    tri: filtreTri,
    type: filtreType,
  })

  const viewModel = listeStructuresAdministrativesPresenter(readModel)

  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Structures administratives' }]}
      />
      <ListeStructuresAdministratives
        filtres={{
          adresse: filtreAdresse ?? '',
          aidantsConnect: aidantsConnect ?? '',
          commune: commune ?? '',
          coop: coop ?? '',
          departement: departement ?? '',
          gouvernance: filtreGouvernance ?? '',
          idposte: idposte ?? '',
          nom: nom ?? '',
          ridet: ridet ?? '',
          rna: rna ?? '',
          siret: siret ?? '',
          type: filtreType ?? '',
        }}
        tri={filtreTri === undefined ? { colonne: '', ordre: '' } : filtreTri}
        viewModel={viewModel}
      />
    </>
  )
}

const colonnesTriables: ReadonlyArray<ColonneTriable> = ['commune', 'nom', 'personnesEmployees', 'rattachements']
