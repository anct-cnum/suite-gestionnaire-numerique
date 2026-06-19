'use client'

import { ReactElement, useContext, useEffect, useState } from 'react'

import ConfirmationModal from '../shared/Modal/ConfirmationModal'
import { Notification } from '../shared/Notification/Notification'
import { clientContext } from '@/components/shared/ClientContext'
import { EntrepriseViewModel } from '@/components/shared/Membre/EntrepriseType'
import { StructureComparaisonViewModel } from '@/presenters/comparaisonDoublonsPresenter'
import { ETAT_ADMINISTRATIF_CANONIQUE } from '@/shared/etatAdministratif'

export default function ModaleCanonisation({ isOpen, onClose, structure }: Props): ReactElement {
  const { canoniserStructureAction, pathname, previsualiserAdresseAction, rechercherUneEntrepriseAction, router } =
    useContext(clientContext)
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
      .then(async (resultat) => {
        if (!('denomination' in resultat)) {
          setEtat({ message: resultat.join(' · '), statut: 'erreur' })
          return
        }
        // On banifie l'adresse INSEE pour afficher côté INSEE ce qui sera réellement écrit (la BAN
        // renvoie une casse normalisée), plutôt que la chaîne brute INSEE en majuscules. Best-effort.
        const apercu = await previsualiserAdresseAction(resultat.adresse)
        setEtat({ adresseBanifiee: apercu?.label ?? null, entreprise: resultat, statut: 'chargee' })
      })
      .catch(() => {
        setEtat({ message: 'Erreur lors de la récupération des données INSEE.', statut: 'erreur' })
      })
  }, [isOpen, structure.siret, previsualiserAdresseAction, rechercherUneEntrepriseAction])

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

  const lignes = lignesComparaison(structure, etat.entreprise, etat.adresseBanifiee)

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
  entreprise: EntrepriseViewModel,
  adresseBanifiee: null | string
): ReadonlyArray<LigneComparaison> {
  function champ(label: string): string {
    return structure.champs.find((candidat) => candidat.label === label)?.valeur ?? '—'
  }

  // La structure ne stocke que le code APE ; on compare donc code à code et on affiche « code — libellé »
  // côté INSEE pour que la ligne ne paraisse pas différente alors qu'il s'agit du même code.
  const apeStructure = champ('Code activité (APE)')
  // Côté INSEE on montre l'adresse banifiée (ce qui sera réellement écrit), pas la chaîne brute INSEE
  // en majuscules. Comparaison normalisée (casse/ponctuation) pour ne pas signaler une fausse différence.
  const adresseInsee = adresseBanifiee ?? entreprise.adresse

  return [
    ligne('Dénomination', structure.denominationSirene || '—', entreprise.denomination),
    {
      identique: memeAdresse(structure.adresse, adresseInsee),
      insee: adresseInsee,
      label: 'Adresse',
      structure: structure.adresse,
    },
    ligne('État administratif', champ('État administratif'), ETAT_ADMINISTRATIF_CANONIQUE),
    {
      identique: apeStructure === entreprise.activitePrincipale,
      insee: avecLibelle(entreprise.activitePrincipale, entreprise.activitePrincipaleLibelle),
      label: 'Code activité (APE)',
      structure: apeStructure,
    },
    ligne(
      'Catégorie juridique',
      '—',
      avecLibelle(entreprise.categorieJuridiqueCode, entreprise.categorieJuridiqueLibelle)
    ),
  ]
}

function ligne(label: string, valeurStructure: string, valeurInsee: string): LigneComparaison {
  return { identique: valeurStructure === valeurInsee, insee: valeurInsee, label, structure: valeurStructure }
}

// « code — libellé » si le libellé existe et diffère du code, sinon le code seul.
function avecLibelle(code: string, libelle: string): string {
  return libelle === '' || libelle === code ? code : `${code} — ${libelle}`
}

// Deux adresses sont « identiques » si elles ne diffèrent que par la casse, la ponctuation ou les
// espaces (l'INSEE renvoie en majuscules, la BAN normalise la casse et ajoute des virgules).
function memeAdresse(adresseA: string, adresseB: string): boolean {
  function normaliser(valeur: string): string {
    return valeur
      .toLowerCase()
      .replace(/[\s,]+/g, ' ')
      .trim()
  }

  return normaliser(adresseA) === normaliser(adresseB)
}

// État du chargement de l'image INSEE : en attente, chargée, ou en erreur (introuvable / réseau).
type EtatInsee =
  | Readonly<{ adresseBanifiee: null | string; entreprise: EntrepriseViewModel; statut: 'chargee' }>
  | Readonly<{ message: string; statut: 'erreur' }>
  | Readonly<{ statut: 'chargement' }>

type Props = Readonly<{
  isOpen: boolean
  onClose(): void
  structure: StructureComparaisonViewModel
}>
