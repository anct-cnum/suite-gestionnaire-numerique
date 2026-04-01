import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import BlocAccueil from '../../blocs/BlocAccueil'
import BlocBeneficiaires from '../../blocs/BlocBeneficiaires'
import BlocCartographie from '../../blocs/BlocCartographie'
import BlocDonneesStructure from '../../blocs/BlocDonneesStructure'
import BlocEtatDesLieux from '../../blocs/BlocEtatDesLieux'
import BlocFinancements from '../../blocs/BlocFinancements'
import BlocGouvernance from '../../blocs/BlocGouvernance'
import BlocMediateurs from '../../blocs/BlocMediateurs'
import BlocRejoindreGouvernance from '../../blocs/BlocRejoindreGouvernance'
import BlocSources from '../../blocs/BlocSources'
import { blocsParContexte, IdentifiantBloc } from '../../registreBlocs'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordGouvernanceController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const { code } = await params

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()

  if (!(codesDepartements.includes(code) || contexte.aCesRoles('administrateur_dispositif'))) {
    redirect('/tableau-de-bord')
  }

  const blocs = blocsParContexte(contexte)
  const scope = { code, type: 'departement' } as const

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

type Props = Readonly<{
  params: Promise<Readonly<{ code: string }>>
}>
