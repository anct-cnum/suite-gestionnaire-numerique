'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, useContext, useState } from 'react'

import EtapeConfirmationMembre from './EtapeConfirmationMembre'
import EtapeSelectionMembre from './EtapeSelectionMembre'
import { AjoutMembreEtape, NouveauMembreData } from './types'
import { clientContext } from '../shared/ClientContext'
import { Notification } from '../shared/Notification/Notification'
import Stepper from '../shared/Stepper/Stepper'

export default function AjouterUnMembrePage({ codeDepartement }: AjouterUnMembrePageProps): ReactElement {
  const router = useRouter()
  const { ajouterUnMembreAction, pathname } = useContext(clientContext)
  const [etapeActuelle, setEtapeActuelle] = useState<AjoutMembreEtape>('selection')
  const [donneesMembre, setDonneesMembre] = useState<NouveauMembreData>({
    contact: null,
    contactSecondaire: null,
    entreprise: null,
  })

  const etapes = [
    { title: 'Sélectionnez la structure' },
    { title: 'Récapitulatif' },
  ]

  const numeroEtapeActuelle = etapeActuelle === 'selection' ? 1 : 2

  return (
    <div className="fr-container fr-py-6w">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-col-lg-8">
          <div className="fr-container--fluid">
            <Stepper
              currentStep={numeroEtapeActuelle}
              steps={etapes}
            />

            {etapeActuelle === 'selection' && (
              <EtapeSelectionMembre 
                donneesMembre={donneesMembre}
                onContinuer={continuerVersConfirmation} 
              />
            )}
            
            {etapeActuelle === 'confirmation' && (
              <EtapeConfirmationMembre
                data={donneesMembre}
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

    try {
      const messages = await ajouterUnMembreAction({
        codeDepartement,
        contact: donneesMembre.contact,
        contactTechnique: donneesMembre.contactSecondaire ?? undefined,
        entreprise: {
          categorieJuridiqueCode: donneesMembre.entreprise.categorieJuridiqueCode,
          categorieJuridiqueUniteLegale: donneesMembre.entreprise.categorieJuridiqueLibelle,
          siret: donneesMembre.entreprise.identifiant,
        },
        nomEntreprise: donneesMembre.entreprise.denomination,
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
        description: 'Une erreur est survenue lors de l\'ajout du membre', 
        title: 'Erreur : ', 
      })
    }
  }
}

type AjouterUnMembrePageProps = Readonly<{
  codeDepartement: string
}>