'use client'

import { ReactElement, useContext, useEffect, useState } from 'react'

import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import { clientContext } from '@/components/shared/ClientContext'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { StructureComparaisonViewModel } from '@/presenters/comparaisonDoublonsPresenter'

export default function ModaleCanonisation({ isOpen, onClose, structure }: Props): ReactElement {
  const { canoniserStructureAction, pathname, rechercherUneEntrepriseAction, router } = useContext(clientContext)
  const [etat, setEtat] = useState<EtatInsee>({ statut: 'chargement' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    if (structure.siret === null) {
      setEtat({ message: 'La structure n’a pas de SIRET : comparaison INSEE impossible.', statut: 'erreur' })
      return
    }
    setEtat({ statut: 'chargement' })
    rechercherUneEntrepriseAction({ siret: structure.siret })
      .then((resultat) => {
        if ('denomination' in resultat) {
          setEtat({ entreprise: resultat, statut: 'chargee' })
        } else {
          setEtat({ message: resultat.join(' · '), statut: 'erreur' })
        }
      })
      .catch(() => {
        setEtat({ message: 'Erreur lors de la récupération des données INSEE.', statut: 'erreur' })
      })
  }, [isOpen, structure.siret, rechercherUneEntrepriseAction])

  async function synchroniser(): Promise<void> {
    setIsSubmitting(true)
    const messages = await canoniserStructureAction({ path: pathname, structureId: structure.id })
    setIsSubmitting(false)
    if (messages.includes('OK')) {
      onClose()
      Notification('success', { description: 'synchronisée avec l’INSEE', title: 'Structure ' })
      router.push('/structures-doublons')
    } else {
      Notification('error', { description: messages.join(' · '), title: 'Erreur : ' })
    }
  }

  const peutSynchroniser = etat.statut === 'chargee' && !isSubmitting

  return (
    <ConfirmationModal
      cancelLabel="Fermer"
      confirmLabel={confirmLabel(etat.statut, isSubmitting)}
      id="canoniser-structure"
      isOpen={isOpen}
      onCancel={onClose}
      onConfirm={() => {
        if (peutSynchroniser) {
          void synchroniser()
        }
      }}
      title="Synchroniser avec l’INSEE"
    >
      <p className="fr-text--sm fr-text-mention--grey">
        La synchronisation aligne la structure sur son image INSEE (dénomination, adresse, état, activité, catégorie
        juridique) et la rend <span className="fr-text--bold">canonique</span> (suppression du libellé d’antenne).
        Action tracée et réservée aux administrateurs autorisés.
      </p>
      <Comparaison etat={etat} structure={structure} />
    </ConfirmationModal>
  )
}

function confirmLabel(statut: EtatInsee['statut'], isSubmitting: boolean): string {
  if (isSubmitting) {
    return 'Synchronisation…'
  }
  if (statut === 'chargement') {
    return 'Chargement…'
  }

  return 'Synchroniser avec INSEE'
}

function Comparaison({
  etat,
  structure,
}: Readonly<{ etat: EtatInsee; structure: StructureComparaisonViewModel }>): ReactElement {
  if (etat.statut === 'chargement') {
    return <p className="fr-mt-2w">Récupération des données INSEE…</p>
  }
  if (etat.statut === 'erreur') {
    return <p className="fr-mt-2w fr-error-text">{etat.message}</p>
  }

  const lignes = lignesComparaison(structure, etat.entreprise)

  return (
    <div className="fr-table fr-table--md fr-mt-2w">
      <div className="fr-table__wrapper">
        <div className="fr-table__container">
          <div className="fr-table__content">
            <table>
              <caption className="fr-sr-only">Comparaison entre la structure et l’INSEE</caption>
              <thead>
                <tr>
                  <th scope="col">Champ</th>
                  <th scope="col">Structure (actuel)</th>
                  <th scope="col">INSEE (après synchro)</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne) => (
                  <tr key={ligne.label}>
                    <th scope="row">{ligne.label}</th>
                    <td>{ligne.structure}</td>
                    <td className={ligne.identique ? '' : 'fr-text--bold'}>{ligne.insee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

type LigneComparaison = Readonly<{
  identique: boolean
  insee: string
  label: string
  structure: string
}>

function lignesComparaison(
  structure: StructureComparaisonViewModel,
  entreprise: EntrepriseViewModel
): ReadonlyArray<LigneComparaison> {
  function champ(label: string): string {
    return structure.champs.find((candidat) => candidat.label === label)?.valeur ?? '—'
  }

  return [
    ligne('Dénomination', structure.denominationSirene || '—', entreprise.denomination),
    ligne('Adresse', structure.adresse, entreprise.adresse),
    ligne('État administratif', champ('État administratif'), 'Actif'),
    ligne('Code activité (APE)', champ('Code activité (APE)'), entreprise.activitePrincipaleLibelle),
    ligne('Catégorie juridique', '—', entreprise.categorieJuridiqueLibelle),
  ]
}

function ligne(label: string, valeurStructure: string, valeurInsee: string): LigneComparaison {
  return { identique: valeurStructure === valeurInsee, insee: valeurInsee, label, structure: valeurStructure }
}

// État du chargement de l'image INSEE : en attente, chargée, ou en erreur (introuvable / réseau).
type EtatInsee =
  | Readonly<{ entreprise: EntrepriseViewModel; statut: 'chargee' }>
  | Readonly<{ message: string; statut: 'erreur' }>
  | Readonly<{ statut: 'chargement' }>

type Props = Readonly<{
  isOpen: boolean
  onClose(): void
  structure: StructureComparaisonViewModel
}>
