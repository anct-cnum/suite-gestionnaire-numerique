import { ReactElement, useState } from 'react'

import EtapeConfirmationMembre from './EtapeConfirmationMembre'
import EtapeSelectionMembre from './EtapeSelectionMembre'
import { AjoutMembreEtape, NouveauMembreData } from './types'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { Notification } from '../shared/Notification/Notification'
import Stepper from '../shared/Stepper/Stepper'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function AjouterUnMembre({
  closeDrawer,
  id,
  labelId,
  uidGouvernance,
}: Props): ReactElement {
  const [etapeActuelle, setEtapeActuelle] = useState<AjoutMembreEtape>('selection')
  const [donneesMembre, setDonneesMembre] = useState<NouveauMembreData>({
    entreprise: null,
    contact: null,
  })

  const etapes = [
    { title: 'Sélection du membre' },
    { title: 'Confirmation' },
  ]

  const numeroEtapeActuelle = etapeActuelle === 'selection' ? 1 : 2

  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon icon="community-line" />
        <br />
        Ajouter un membre à la gouvernance
      </DrawerTitle>
      
      <Stepper
        currentStep={numeroEtapeActuelle}
        steps={etapes}
      />

      <div className="fr-mt-4w">
        {etapeActuelle === 'selection' && (
          <EtapeSelectionMembre onContinuer={continuerVersConfirmation} />
        )}
        
        {etapeActuelle === 'confirmation' && (
          <EtapeConfirmationMembre
            data={donneesMembre}
            onConfirmer={confirmerAjoutMembre}
            onRetour={retourVersSelection}
          />
        )}
      </div>
    </>
  )

  function continuerVersConfirmation(data: NouveauMembreData): void {
    setDonneesMembre(data)
    setEtapeActuelle('confirmation')
  }

  function retourVersSelection(): void {
    setEtapeActuelle('selection')
  }

  async function confirmerAjoutMembre(): Promise<void> {
    try {
      // TODO: Implémenter l'appel vers l'action de création du membre
      // avec les données de l'entreprise et du contact
      
      // Simulation temporaire
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      Notification('success', { 
        description: `${donneesMembre.entreprise?.denominationUniteLegale} ajouté avec succès`, 
        title: 'Membre ' 
      })
      closeDrawer()
    } catch {
      Notification('error', { 
        description: 'Une erreur est survenue lors de l\'ajout du membre', 
        title: 'Erreur : ' 
      })
    }
  }
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  labelId: string
  uidGouvernance: string
}>