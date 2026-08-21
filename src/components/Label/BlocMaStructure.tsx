'use client'

import { usePathname } from 'next/navigation'
import { ChangeEvent, ReactElement, SyntheticEvent, useState } from 'react'

import { EntrepriseViewModel } from '../shared/Membre/EntrepriseType'
import { Notification } from '../shared/Notification/Notification'
import Search from '../shared/Search/Search'
import { mettreAJourStructureLabelAction } from '@/app/api/actions/mettreAJourStructureLabelAction'
import { rechercherUneEntrepriseAction } from '@/app/api/actions/rechercherUneEntrepriseAction'
import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import { LabellisationEtape1ViewModel } from '@/presenters/labellisationPresenter'

export default function BlocMaStructure({ identite, onModeEditionChange, structureId }: Props): ReactElement {
  const pathname = usePathname()
  const [enEdition, setEnEdition] = useState(false)
  const [siret, setSiret] = useState('')
  const [entreprise, setEntreprise] = useState<EntrepriseViewModel | null>(null)
  const [erreur, setErreur] = useState('')
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false)

  function changerModeEdition(estEnEdition: boolean): void {
    setEnEdition(estEnEdition)
    onModeEditionChange(estEnEdition)
  }

  function ouvrirEdition(): void {
    setSiret('')
    setEntreprise(null)
    setErreur('')
    changerModeEdition(true)
  }

  function annulerEdition(): void {
    changerModeEdition(false)
  }

  function changerSiret(event: ChangeEvent<HTMLInputElement>): void {
    const nouveauSiret = event.target.value.replace(/\D/g, '').slice(0, 14)
    setSiret(nouveauSiret)
    setErreur('')
    if (nouveauSiret !== siret) {
      setEntreprise(null)
    }
  }

  function reinitialiserSiret(): void {
    setSiret('')
    setEntreprise(null)
    setErreur('')
  }

  function soumettreRecherche(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (siret.length === 14 || (siret.length >= 6 && siret.length <= 7)) {
      void rechercherEntreprise()
    } else if (siret.length > 0) {
      setErreur('Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)')
    }
  }

  async function rechercherEntreprise(): Promise<void> {
    setErreur('')
    try {
      const result = await rechercherUneEntrepriseAction({ siret })
      if (Array.isArray(result)) {
        setErreur('Le SIRET renseigné n’a pas pu être retrouvé. Vérifiez le numéro saisi.')
      } else {
        setEntreprise(result as EntrepriseViewModel)
      }
    } catch {
      setErreur('Erreur lors de la recherche. Veuillez réessayer.')
    }
  }

  async function enregistrer(): Promise<void> {
    if (entreprise === null) {
      return
    }
    setEnregistrementEnCours(true)
    const messages = await mettreAJourStructureLabelAction({
      path: pathname,
      siret: entreprise.identifiant,
      structureId,
    })
    setEnregistrementEnCours(false)
    if (messages.includes('OK')) {
      Notification('success', {
        description: 'Les informations de votre structure ont bien été mises à jour.',
        title: 'Structure ',
      })
      changerModeEdition(false)
    } else {
      messages.forEach((message) => {
        Notification('error', { description: message, title: 'Erreur ' })
      })
    }
  }

  return (
    <section aria-labelledby="ma-structure" className="grey-border border-radius fr-mb-2w fr-p-4w">
      <header>
        <div className="fr-mb-2w" style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <h2 className="fr-h6 fr-mb-0" id="ma-structure">
            Ma structure
          </h2>
          {enEdition ? null : (
            <button className="fr-btn fr-btn--tertiary fr-btn--sm" onClick={ouvrirEdition} type="button">
              Modifier
            </button>
          )}
        </div>
        <div className="separator fr-mb-3w" />
      </header>
      {enEdition ? (
        <div>
          <Search
            labelBouton="Rechercher"
            placeholder="Renseignez le Numéro SIRET ou RIDET *"
            rechercher={changerSiret}
            reinitialiserBouton="Effacer la recherche"
            reinitialiserLesTermesDeRechercheNomOuEmail={reinitialiserSiret}
            soumettreLaRecherche={soumettreRecherche}
            termesDeRechercheNomOuEmail={siret}
          />
          <p className="color-grey fr-mb-1w">Format attendu : SIRET (14 chiffres) ou RIDET (6 ou 7 chiffres)</p>
          {erreur ? (
            <div className="fr-alert fr-alert--error fr-mt-2w">
              <p>{erreur}</p>
            </div>
          ) : null}
          {entreprise ? (
            <div className="fr-card fr-mt-3w background-blue-france">
              <div className="fr-card__body">
                <div className="fr-card__content">
                  <h3 className="fr-card__title color-blue-france">{entreprise.denomination}</h3>
                  <p className="fr-card__desc">
                    {entreprise.activitePrincipaleLibelle}
                    <br />
                    {entreprise.categorieJuridiqueLibelle}
                    <br />
                    {entreprise.adresse}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <div className="fr-grid-row fr-mt-3w">
            <div className="fr-col-6">
              <button className="fr-btn fr-btn--secondary" onClick={annulerEdition} type="button">
                Annuler
              </button>
            </div>
            <div className="fr-col-6 fr-grid-row--right" style={{ display: 'flex' }}>
              <button
                className="fr-btn"
                disabled={entreprise === null || enregistrementEnCours}
                onClick={() => {
                  void enregistrer()
                }}
                type="button"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InfoStructure libelle="Raison sociale" valeur={identite.nom} />
          <div style={{ display: 'flex', gap: '24px' }}>
            <InfoStructure
              libelle="Numéro de SIRET"
              valeur={
                <ExternalLink
                  className="color-blue-france"
                  href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${identite.siret}`}
                  title={`SIRET ${identite.siret}`}
                >
                  {identite.siret}
                </ExternalLink>
              }
            />
            <InfoStructure libelle="Typologie" valeur={identite.typologie} />
          </div>
          <InfoStructure libelle="Adresse de l’établissement" valeur={identite.adresse} />
          <div style={{ display: 'flex', gap: '24px' }}>
            <InfoStructure libelle="Région" valeur={identite.region} />
            <InfoStructure libelle="Département" valeur={identite.departement} />
          </div>
        </div>
      )}
    </section>
  )
}

function InfoStructure({ libelle, valeur }: InfoStructureProps): ReactElement {
  return (
    <div style={{ flex: '1 0 0' }}>
      <div className="color-grey">{libelle}</div>
      <div className="font-weight-500">{valeur}</div>
    </div>
  )
}

type Props = Readonly<{
  identite: LabellisationEtape1ViewModel['identite']
  onModeEditionChange(enEdition: boolean): void
  structureId: number
}>

type InfoStructureProps = Readonly<{
  libelle: string
  valeur: ReactElement | string
}>
