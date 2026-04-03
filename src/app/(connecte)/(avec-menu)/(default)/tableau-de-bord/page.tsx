import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import BlocAccueil from './blocs/BlocAccueil'
import BlocBeneficiaires from './blocs/BlocBeneficiaires'
import BlocCartographie from './blocs/BlocCartographie'
import BlocDonneesStructure from './blocs/BlocDonneesStructure'
import BlocEtatDesLieux from './blocs/BlocEtatDesLieux'
import BlocFinancements from './blocs/BlocFinancements'
import BlocGouvernance from './blocs/BlocGouvernance'
import BlocMediateurs from './blocs/BlocMediateurs'
import BlocRejoindreGouvernance from './blocs/BlocRejoindreGouvernance'
import BlocSources from './blocs/BlocSources'
import { blocsParContexte, IdentifiantBloc } from './registreBlocs'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancesSelecteurPresenteur } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'
import { resoudreContexte, Scope } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())

  const options = gouvernancesSelecteurPresenteur(contexte)
  if (options.length >= 2 && options[0].value !== 'France') {
    redirect(`/tableau-de-bord/departement/${options[0].value}`)
  }

  const blocs = blocsParContexte(contexte)

  let scope: Scope | undefined
  if (contexte.aCesRoles('administrateur_dispositif')) {
    scope = contexte.scopes.find((scope) => scope.type === 'france')
  } else if (contexte.aCesRoles('gestionnaire_departement')) {
    scope = contexte.scopes.find((scope) => scope.type === 'departement')
  } else if (options.length === 1 && options[0].value !== 'France') {
    scope = { code: options[0].value, type: 'departement' }
  } else {
    scope = contexte.scopes.find((scope) => scope.type === 'structure')
  }

  if (scope === undefined) {
    redirect('/mes-utilisateurs')
  }

  const blocsElements: Record<IdentifiantBloc, ReactElement> = {
    accueil: <BlocAccueil contexte={contexte} key="accueil" prenom={utilisateur.prenom} scope={scope} />,
    beneficiaires: <BlocBeneficiaires key="beneficiaires" scope={scope} />,
    cartographie: <BlocCartographie key="cartographie" />,
    donneesStructure: <BlocDonneesStructure key="donneesStructure" scope={scope} />,
    etatDesLieux: <BlocEtatDesLieux key="etatDesLieux" scope={scope} />,
    financements: <BlocFinancements key="financements" scope={scope} />,
    gouvernance: <BlocGouvernance key="gouvernance" scope={scope} />,
    mediateurs: <BlocMediateurs key="mediateurs" scope={scope} />,
    rejoindreGouvernance: <BlocRejoindreGouvernance key="rejoindreGouvernance" />,
    sources: <BlocSources key="sources" />,
  }

  return <>{blocs.map((bloc) => blocsElements[bloc])}</>
}
