// Stryker disable all
'use client'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createContext, PropsWithChildren, ReactElement, useMemo } from 'react'

import { accepterUnMembreAction } from '@/app/api/actions/accepterUnMembreAction'
import { ajouterUnComiteAction } from '@/app/api/actions/ajouterUnComiteAction'
import { ajouterUneActionAction } from '@/app/api/actions/ajouterUneActionAction'
import { ajouterUneFeuilleDeRouteAction } from '@/app/api/actions/ajouterUneFeuilleDeRouteAction'
import { ajouterUneNoteDeContexteAction } from '@/app/api/actions/ajouterUneNoteDeContexteAction'
import { ajouterUneNoteDeContextualisationAction } from '@/app/api/actions/ajouterUneNoteDeContextualisationAction'
import { ajouterUneNotePriveeAction } from '@/app/api/actions/ajouterUneNotePriveeAction'
import { ajouterUnMembreAction } from '@/app/api/actions/ajouterUnMembreAction'
import { canoniserStructureAction } from '@/app/api/actions/canoniserStructureAction'
import { changerMaStructureAction } from '@/app/api/actions/changerMaStructureAction'
import { changerMonDepartementAction } from '@/app/api/actions/changerMonDepartementAction'
import { changerMonRoleAction } from '@/app/api/actions/changerMonRoleAction'
import { definirUnCoPorteurAction } from '@/app/api/actions/definirUnCoPorteurAction'
import { fusionnerStructuresAction } from '@/app/api/actions/fusionnerStructuresAction'
import { inviterUnUtilisateurAction } from '@/app/api/actions/inviterUnUtilisateurAction'
import { modifierAdresseStructureAction } from '@/app/api/actions/modifierAdresseStructureAction'
import { modifierContactReferentStructureAction } from '@/app/api/actions/modifierContactReferentStructureAction'
import { modifierLieuInclusionDescriptionAction } from '@/app/api/actions/modifierLieuInclusionDescriptionAction'
import { modifierLieuInclusionInformationsPratiquesAction } from '@/app/api/actions/modifierLieuInclusionInformationsPratiquesAction'
import { modifierLieuInclusionServicesModaliteAction } from '@/app/api/actions/modifierLieuInclusionServicesModaliteAction'
import { modifierLieuInclusionServicesTypeAccompagnementAction } from '@/app/api/actions/modifierLieuInclusionServicesTypeAccompagnementAction'
import { modifierLieuInclusionServicesTypePublicAction } from '@/app/api/actions/modifierLieuInclusionServicesTypePublicAction'
import { modifierMesInformationsPersonnellesAction } from '@/app/api/actions/modifierMesInformationsPersonnellesAction'
import { modifierNomStructureAction } from '@/app/api/actions/modifierNomStructureAction'
import { modifierUnComiteAction } from '@/app/api/actions/modifierUnComiteAction'
import { modifierUneActionAction } from '@/app/api/actions/modifierUneActionAction'
import { modifierUneFeuilleDeRouteAction } from '@/app/api/actions/modifierUneFeuilleDeRouteAction'
import { modifierUneNoteDeContexteAction } from '@/app/api/actions/modifierUneNoteDeContexteAction'
import { modifierUneNoteDeContextualisationAction } from '@/app/api/actions/modifierUneNoteDeContextualisationAction'
import { modifierUneNotePriveeAction } from '@/app/api/actions/modifierUneNotePriveeAction'
import { previsualiserAdresseAction } from '@/app/api/actions/previsualiserAdresseAction'
import { rechercherUneEntrepriseAction } from '@/app/api/actions/rechercherUneEntrepriseAction'
import { reinviterUnUtilisateurAction } from '@/app/api/actions/reinviterUnUtilisateurAction'
import { rejoindreUneGouvernanceAction } from '@/app/api/actions/rejoindreUneGouvernanceAction'
import { retirerUnCoPorteurAction } from '@/app/api/actions/retirerUnCoPorteurAction'
import { supprimerDocumentAction } from '@/app/api/actions/supprimerDocumentAction'
import { supprimerMonCompteAction } from '@/app/api/actions/supprimerMonCompteAction'
import { supprimerUnComiteAction } from '@/app/api/actions/supprimerUnComiteAction'
import { supprimerUneActionAction } from '@/app/api/actions/supprimerUneActionAction'
import { supprimerUneNoteDeContexteAction } from '@/app/api/actions/supprimerUneNoteDeContexteAction'
import { supprimerUneNoteDeContextualisationAction } from '@/app/api/actions/supprimerUneNoteDeContextualisationAction'
import { supprimerUneNotePriveeAction } from '@/app/api/actions/supprimerUneNotePriveeAction'
import { supprimerUnMembreOuCandidatAction } from '@/app/api/actions/supprimerUnMembreOuCandidatAction'
import { supprimerUnUtilisateurAction } from '@/app/api/actions/supprimerUnUtilisateurAction'
import { transfererMembreAction } from '@/app/api/actions/transfererMembreAction'
import { transfererNotionsStructureAction } from '@/app/api/actions/transfererNotionsStructureAction'
import { SessionUtilisateurViewModel } from '@/presenters/sessionUtilisateurPresenter'

export default function ClientContext({
  children,
  roles,
  sessionUtilisateurViewModel,
  utilisateursParPage,
}: Props): ReactElement {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const clientContextProviderValue = useMemo(
    () => ({
      accepterUnMembreAction,
      ajouterUnComiteAction,
      ajouterUneActionAction,
      ajouterUneFeuilleDeRouteAction,
      ajouterUneNoteDeContexteAction,
      ajouterUneNoteDeContextualisationAction,
      ajouterUneNotePriveeAction,
      ajouterUnMembreAction,
      canoniserStructureAction,
      changerMaStructureAction,
      changerMonDepartementAction,
      changerMonRoleAction,
      definirUnCoPorteurAction,
      fusionnerStructuresAction,
      inviterUnUtilisateurAction,
      modifierAdresseStructureAction,
      modifierContactReferentStructureAction,
      modifierLieuInclusionDescriptionAction,
      modifierLieuInclusionInformationsPratiquesAction,
      modifierLieuInclusionServicesModaliteAction,
      modifierLieuInclusionServicesTypeAccompagnementAction,
      modifierLieuInclusionServicesTypePublicAction,
      modifierMesInformationsPersonnellesAction,
      modifierNomStructureAction,
      modifierUnComiteAction,
      modifierUneActionAction,
      modifierUneFeuilleDeRouteAction,
      modifierUneNoteDeContexteAction,
      modifierUneNoteDeContextualisationAction,
      modifierUneNotePriveeAction,
      pathname,
      previsualiserAdresseAction,
      rechercherUneEntrepriseAction,
      reinviterUnUtilisateurAction,
      rejoindreUneGouvernanceAction,
      retirerUnCoPorteurAction,
      roles,
      router,
      searchParams,
      sessionUtilisateurViewModel,
      supprimerDocumentAction,
      supprimerMonCompteAction,
      supprimerUnComiteAction,
      supprimerUneActionAction,
      supprimerUneNoteDeContexteAction,
      supprimerUneNoteDeContextualisationAction,
      supprimerUneNotePriveeAction,
      supprimerUnMembreOuCandidatAction,
      supprimerUnUtilisateurAction,
      transfererMembreAction,
      transfererNotionsStructureAction,
      utilisateursParPage,
    }),
    [pathname, roles, router, searchParams, sessionUtilisateurViewModel, utilisateursParPage]
  )

  return <clientContext.Provider value={clientContextProviderValue}>{children}</clientContext.Provider>
}

export const clientContext = createContext({} as ClientContextProviderValue)

export type ClientContextProviderValue = Readonly<{
  accepterUnMembreAction: typeof accepterUnMembreAction
  ajouterUnComiteAction: typeof ajouterUnComiteAction
  ajouterUneActionAction: typeof ajouterUneActionAction
  ajouterUneFeuilleDeRouteAction: typeof ajouterUneFeuilleDeRouteAction
  ajouterUneNoteDeContexteAction: typeof ajouterUneNoteDeContexteAction
  ajouterUneNoteDeContextualisationAction: typeof ajouterUneNoteDeContextualisationAction
  ajouterUneNotePriveeAction: typeof ajouterUneNotePriveeAction
  ajouterUnMembreAction: typeof ajouterUnMembreAction
  canoniserStructureAction: typeof canoniserStructureAction
  changerMaStructureAction: typeof changerMaStructureAction
  changerMonDepartementAction: typeof changerMonDepartementAction
  changerMonRoleAction: typeof changerMonRoleAction
  definirUnCoPorteurAction: typeof definirUnCoPorteurAction
  fusionnerStructuresAction: typeof fusionnerStructuresAction
  inviterUnUtilisateurAction: typeof inviterUnUtilisateurAction
  modifierAdresseStructureAction: typeof modifierAdresseStructureAction
  modifierContactReferentStructureAction: typeof modifierContactReferentStructureAction
  modifierLieuInclusionDescriptionAction: typeof modifierLieuInclusionDescriptionAction
  modifierLieuInclusionInformationsPratiquesAction: typeof modifierLieuInclusionInformationsPratiquesAction
  modifierLieuInclusionServicesModaliteAction: typeof modifierLieuInclusionServicesModaliteAction
  modifierLieuInclusionServicesTypeAccompagnementAction: typeof modifierLieuInclusionServicesTypeAccompagnementAction
  modifierLieuInclusionServicesTypePublicAction: typeof modifierLieuInclusionServicesTypePublicAction
  modifierMesInformationsPersonnellesAction: typeof modifierMesInformationsPersonnellesAction
  modifierNomStructureAction: typeof modifierNomStructureAction
  modifierUnComiteAction: typeof modifierUnComiteAction
  modifierUneActionAction: typeof modifierUneActionAction
  modifierUneFeuilleDeRouteAction: typeof modifierUneFeuilleDeRouteAction
  modifierUneNoteDeContexteAction: typeof modifierUneNoteDeContexteAction
  modifierUneNoteDeContextualisationAction: typeof modifierUneNoteDeContextualisationAction
  modifierUneNotePriveeAction: typeof modifierUneNotePriveeAction
  pathname: string
  previsualiserAdresseAction: typeof previsualiserAdresseAction
  rechercherUneEntrepriseAction: typeof rechercherUneEntrepriseAction
  reinviterUnUtilisateurAction: typeof reinviterUnUtilisateurAction
  rejoindreUneGouvernanceAction: typeof rejoindreUneGouvernanceAction
  retirerUnCoPorteurAction: typeof retirerUnCoPorteurAction
  roles: ReadonlyArray<string>
  router: AppRouterInstance
  searchParams: URLSearchParams
  sessionUtilisateurViewModel: SessionUtilisateurViewModel
  supprimerDocumentAction: typeof supprimerDocumentAction
  supprimerMonCompteAction: typeof supprimerMonCompteAction
  supprimerUnComiteAction: typeof supprimerUnComiteAction
  supprimerUneActionAction: typeof supprimerUneActionAction
  supprimerUneNoteDeContexteAction: typeof supprimerUneNoteDeContexteAction
  supprimerUneNoteDeContextualisationAction: typeof supprimerUneNoteDeContextualisationAction
  supprimerUneNotePriveeAction: typeof supprimerUneNotePriveeAction
  supprimerUnMembreOuCandidatAction: typeof supprimerUnMembreOuCandidatAction
  supprimerUnUtilisateurAction: typeof supprimerUnUtilisateurAction
  transfererMembreAction: typeof transfererMembreAction
  transfererNotionsStructureAction: typeof transfererNotionsStructureAction
  utilisateursParPage: number
}>
type Props = PropsWithChildren<
  Readonly<{
    roles: ReadonlyArray<string>
    sessionUtilisateurViewModel: SessionUtilisateurViewModel
    utilisateursParPage: number
  }>
>
