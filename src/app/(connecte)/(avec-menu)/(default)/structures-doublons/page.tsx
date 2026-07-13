import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import departements from '../../../../../../ressources/departements.json'
import StructuresDoublons from '@/components/StructuresDoublons/StructuresDoublons'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresDoublonsLoader } from '@/gateways/PrismaStructuresDoublonsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import {
  colonnesTriablesDoublons,
  structuresDoublonsPresenter,
  triDoublonsParDefaut,
} from '@/presenters/structuresDoublonsPresenter'
import { RechercherStructuresDoublons, SignalDoublon } from '@/use-cases/queries/RechercherStructuresDoublons'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Doublons de structures',
}

export default async function StructuresDoublonsController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(session.user.sub)
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif') || !contexte.isBetaTesteur) {
    redirect('/tableau-de-bord')
  }

  const { departement, nom, ordre, ridet, rna, signal, siret, tri } = await searchParams
  const filtreSignal = signauxValides.find((signalValide) => signalValide === signal)
  const filtreDepartement = departements.some((candidat) => candidat.code === departement) ? departement : undefined
  const filtreNom = valeurRenseignee(nom)
  const filtreSiret = valeurRenseignee(siret)
  const filtreRna = valeurRenseignee(rna)
  const filtreRidet = valeurRenseignee(ridet)

  const colonneTri = colonnesTriablesDoublons.find((colonne) => colonne === tri)
  const ordreTri: 'asc' | 'desc' | undefined = ordre === 'asc' || ordre === 'desc' ? ordre : undefined
  const triEffectif =
    colonneTri !== undefined && ordreTri !== undefined ? { colonne: colonneTri, ordre: ordreTri } : triDoublonsParDefaut

  const readModel = await new RechercherStructuresDoublons(new PrismaStructuresDoublonsLoader()).handle({
    criteres: {
      nom: filtreNom,
      ridet: filtreRidet,
      rna: filtreRna,
      siret: filtreSiret,
    },
    signaux: filtreSignal === undefined ? [] : [filtreSignal],
    zone: filtreDepartement === undefined ? undefined : { code: filtreDepartement, type: 'departement' },
  })
  const viewModel = structuresDoublonsPresenter(readModel, triEffectif)

  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Doublons de structures' }]}
      />
      <StructuresDoublons
        filtres={{
          departement: filtreDepartement ?? '',
          nom: filtreNom ?? '',
          ridet: filtreRidet ?? '',
          rna: filtreRna ?? '',
          signal: filtreSignal ?? '',
          siret: filtreSiret ?? '',
        }}
        tri={triEffectif}
        viewModel={viewModel}
      />
    </>
  )
}

function valeurRenseignee(valeur?: string): string | undefined {
  const nettoyee = valeur?.trim() ?? ''
  return nettoyee === '' ? undefined : nettoyee
}

const signauxValides: ReadonlyArray<SignalDoublon> = [
  'identifiant_externe_partage',
  'nom_commune_proche',
  'siret_antenne_ambigu',
]

type Props = Readonly<{
  searchParams: Promise<
    Readonly<{
      departement?: string
      nom?: string
      ordre?: string
      ridet?: string
      rna?: string
      signal?: string
      siret?: string
      tri?: string
    }>
  >
}>
