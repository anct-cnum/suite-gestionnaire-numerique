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
import { Contexte, resoudreContexte } from '@/use-cases/queries/ResoudreContexte'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

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
  const blocs = blocsParContexte(contexte)
  return (
    <>
      {blocs.map((bloc) => renderBloc(bloc, contexte, utilisateur))}
    </>
  )
}

function renderBloc(
  bloc: IdentifiantBloc,
  contexte: Contexte,
  utilisateur: UnUtilisateurReadModel
): ReactElement {
  const blocsRenderers: Record<IdentifiantBloc, () => ReactElement> = {
    accueil: () => (
      <BlocAccueil
        contexte={contexte}
        key="accueil"
        prenom={utilisateur.prenom}
      />),
    beneficiaires: () => (
      <BlocBeneficiaires
        contexte={contexte}
        key="beneficiaires"
      />),
    cartographie: () => <BlocCartographie key="cartographie" />,
    donneesStructure: () => (
      <BlocDonneesStructure
        contexte={contexte}
        key="donneesStructure"
      />),
    etatDesLieux: () => (
      <BlocEtatDesLieux
        contexte={contexte}
        key="etatDesLieux"
      />),
    financements: () => (
      <BlocFinancements
        contexte={contexte}
        key="financements"
      />),
    gouvernance: () => (
      <BlocGouvernance
        contexte={contexte}
        key="gouvernance"
      />),
    mediateurs: () => (
      <BlocMediateurs
        contexte={contexte}
        key="mediateurs"
      />),
    rejoindreGouvernance: () => <BlocRejoindreGouvernance key="rejoindreGouvernance" />,
    sources: () => <BlocSources key="sources" />,
  }

  return blocsRenderers[bloc]()
}
