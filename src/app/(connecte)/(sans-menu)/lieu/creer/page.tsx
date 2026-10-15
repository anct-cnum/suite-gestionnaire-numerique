import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import CreerLieuInclusion from '@/components/CreerLieuInclusion/CreerLieuInclusion'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: "Création d'un lieu d'activité",
}

// Le segment statique `creer` prime sur `lieu/[id]` : la fiche n'est jamais appelée avec
// l'identifiant « creer ». Création réservée aux administrateurs (#1495).
async function CreerLieuPage(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  if (!contexte.aCesRoles('administrateur_dispositif')) {
    redirect('/tableau-de-bord')
  }

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/liste-lieux-inclusion', label: 'Suivi des lieux' },
          { label: 'Création d’un lieu' },
        ]}
      />
      <CreerLieuInclusion />
    </>
  )
}

export default CreerLieuPage
