'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useContext, useState } from 'react'

import EtapeConfirmationMembre from './EtapeConfirmationMembre'
import EtapeSelectionMembre from './EtapeSelectionMembre'
import { AjoutMembreEtape, NouveauMembreData } from './types'
import { clientContext } from '../shared/ClientContext'
import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import { Notification } from '../shared/Notification/Notification'
import Stepper from '../shared/Stepper/Stepper'

export default function AjouterUnMembrePage({ candidature, codeDepartement }: AjouterUnMembrePageProps): ReactElement {
  const router = useRouter()
  const { ajouterUnMembreAction, pathname, rejoindreUneGouvernanceAction } = useContext(clientContext)
  const [etapeActuelle, setEtapeActuelle] = useState<AjoutMembreEtape>('selection')
  const [donneesMembre, setDonneesMembre] = useState<NouveauMembreData>({
    contact: null,
    contactSecondaire: null,
    departement: null,
    entreprise: candidature?.entreprise ?? null,
  })

  const etapes = [{ title: 'Sélectionnez la structure' }, { title: 'Récapitulatif' }]

  const numeroEtapeActuelle = etapeActuelle === 'selection' ? 1 : 2

  return (
    <div className="fr-container fr-py-6w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-8">
          <div className="fr-container--fluid">
            <Stepper currentStep={numeroEtapeActuelle} steps={etapes} />

            {etapeActuelle === 'selection' && (
              <EtapeSelectionMembre
                departements={candidature?.departements}
                donneesMembre={donneesMembre}
                onContinuer={continuerVersConfirmation}
              />
            )}

            {etapeActuelle === 'confirmation' && (
              <EtapeConfirmationMembre
                data={donneesMembre}
                labelBoutonConfirmer={candidature ? 'Ajouter ma structure' : 'Ajouter cette structure'}
                onConfirmer={confirmerAjoutMembre}
                onRetour={retourVersSelection}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  function continuerVersConfirmation(data: NouveauMembreData): void {
    setDonneesMembre(data)
    setEtapeActuelle('confirmation')
  }

  function retourVersSelection(): void {
    setEtapeActuelle('selection')
  }

  async function confirmerAjoutMembre(): Promise<void> {
    if (!donneesMembre.entreprise || !donneesMembre.contact) {
      return
    }

    if (candidature) {
      await confirmerCandidature(donneesMembre.entreprise.denomination, donneesMembre.contact)
      return
    }

    try {
      const messages = await ajouterUnMembreAction({
        codeDepartement: codeDepartement ?? '',
        contact: donneesMembre.contact,
        contactTechnique: donneesMembre.contactSecondaire ?? undefined,
        entreprise: {
          adresse: donneesMembre.entreprise.adresse,
          categorieJuridiqueCode: donneesMembre.entreprise.categorieJuridiqueCode,
          categorieJuridiqueUniteLegale: donneesMembre.entreprise.categorieJuridiqueLibelle,
          codeInsee: donneesMembre.entreprise.codeInsee,
          codePostal: donneesMembre.entreprise.codePostal,
          commune: donneesMembre.entreprise.commune,
          nom: donneesMembre.entreprise.denomination,
          nomVoie: donneesMembre.entreprise.nomVoie,
          numeroVoie: donneesMembre.entreprise.numeroVoie,
          siret: donneesMembre.entreprise.identifiant,
        },
        path: pathname,
      })

      if (messages.includes('OK')) {
        Notification('success', {
          description: `${donneesMembre.entreprise.denomination} ajouté avec succès`,
          title: 'Membre ',
        })

        // Retour à la page de gestion des membres avec l'onglet candidats sélectionné
        const basePath = pathname.replace('/ajouter', '')
        router.push(`${basePath}?statut=candidat`)
      } else {
        Notification('error', {
          description: (messages as ReadonlyArray<string>).join(', '),
          title: 'Erreur : ',
        })
      }
    } catch {
      Notification('error', {
        description: "Une erreur est survenue lors de l'ajout du membre",
        title: 'Erreur : ',
      })
    }
  }

  async function confirmerCandidature(
    denomination: string,
    contact: NonNullable<NouveauMembreData['contact']>
  ): Promise<void> {
    if (!donneesMembre.departement) {
      return
    }

    try {
      const messages = await rejoindreUneGouvernanceAction({
        codeDepartement: donneesMembre.departement.code,
        contact,
        contactTechnique: donneesMembre.contactSecondaire ?? undefined,
        path: pathname,
      })

      if (messages.includes('OK')) {
        Notification('success', {
          description: `${denomination} ajouté avec succès`,
          title: 'Membre ',
        })

        router.push('/tableau-de-bord')
      } else {
        Notification('error', {
          description: (messages as ReadonlyArray<string>).join(', '),
          title: 'Erreur : ',
        })
      }
    } catch {
      Notification('error', {
        description: 'Une erreur est survenue lors de la candidature',
        title: 'Erreur : ',
      })
    }
  }
}

type AjouterUnMembrePageProps = Readonly<{
  candidature?: Readonly<{
    departements: ReadonlyArray<
      Readonly<{
        label: string
        value: string
      }>
    >
    entreprise: EntrepriseViewModel
  }>
  codeDepartement?: string
}>
