import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { construireBlocs } from './blocsTableauDeBord'
import { blocsParContexte } from './registreBlocs'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancesSelecteurPresenteur } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'
import { perimetreRechercheDuContexte } from '@/use-cases/queries/PerimetreRechercheTerritoire'
import { resoudreContexte, Scope } from '@/use-cases/queries/ResoudreContexte'
import { TerritoireTableauDeBord } from '@/use-cases/queries/shared/TerritoireTableauDeBord'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findById(await getSessionUtilisateurId())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  // Le gestionnaire région atterrit sur le tableau de bord de sa région (validation PO #1279).
  const codeRegion = contexte.codeRegion()
  if (contexte.aCesRoles('gestionnaire_region') && codeRegion !== null) {
    redirect(`/tableau-de-bord/region/${codeRegion}`)
  }

  const options = gouvernancesSelecteurPresenteur(contexte)
  if (options.length >= 2 && options[0].value !== 'France') {
    redirect(`/tableau-de-bord/departement/${options[0].value}`)
  }

  let scope: Scope | undefined
  if (contexte.aCesRoles('administrateur_dispositif')) {
    scope = contexte.scopes.find((scope) => scope.type === 'france')
  } else if (contexte.aCesRoles('gestionnaire_departement')) {
    scope = contexte.scopes.find((scope) => scope.type === 'departement')
  } else if (contexte.estGestionnaireStructureSansCoportage()) {
    scope = contexte.scopes.find((scope) => scope.type === 'structure')
  } else if (options.length === 1 && options[0].value !== 'France') {
    scope = { code: options[0].value, type: 'departement' }
  } else {
    scope = contexte.scopes.find((scope) => scope.type === 'structure')
  }

  if (scope === undefined) {
    redirect('/mes-utilisateurs')
  }

  const territoire = territoireDuScope(scope)
  const perimetre = perimetreRechercheDuContexte(contexte)

  const blocs = blocsParContexte(contexte, territoire.type)
  const blocsElements = construireBlocs({ contexte, perimetre, prenom: utilisateur.prenom, territoire })

  return <>{blocs.map((bloc) => blocsElements[bloc])}</>
}

function territoireDuScope(scope: Scope): TerritoireTableauDeBord {
  if (scope.type === 'france') {
    return { type: 'france' }
  }
  if (scope.type === 'structure') {
    return { structureId: parseInt(scope.code, 10), type: 'structure' }
  }
  return { code: scope.code, type: 'departement' }
}
