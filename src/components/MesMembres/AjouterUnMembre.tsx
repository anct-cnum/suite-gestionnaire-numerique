import { FormEvent, ReactElement, useContext, useState } from 'react'

import styles from './Membres.module.css'
import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import { Notification } from '../shared/Notification/Notification'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import { MesMembresViewModel } from '@/presenters/mesMembresPresenter'

export default function AjouterUnMembre({
  closeDrawer,
  id,
  labelId,
  candidatsOuSuggeres,
  uidGouvernance,
}: Props): ReactElement {
  const { accepterUnMembreAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(true)
  const [informationsMembre, setInformationsMembre] = useState<MesMembresViewModel['candidatsOuSuggeres'][0] | null>(null)
  const [isAdded, setIsAdded] = useState(false)

  return (
    <>
      <DrawerTitle id={labelId}>
        Ajouter un membre à la gouvernance
      </DrawerTitle>
      <p className="fr-text--sm color-grey">
        Sélectionnez une collectivité ou une structure parmi la liste des volontaires.
      </p>
      <form
        aria-label="Ajouter un membre à la gouvernance"
        method="dialog"
        onSubmit={ajouterUnMembre}
      >
        <fieldset className="grey-border fr-mb-2w fr-p-2w">
          <legend className="fr-sr-only">
            Sélectionner un membre
          </legend>
          <label
            className="fr-label"
            htmlFor="membres"
          >
            Membre candidat ou suggéré
          </label>
          <select
            className="fr-select fr-mb-2w"
            defaultValue=""
            id="membres"
            name="membre"
            onChange={selectionnerUnMembre}
          >
            <option value="">
              Sélectionner un membre
            </option>
            {
              candidatsOuSuggeres.map((candidatOuSuggere): ReactElement => (
                <option
                  key={candidatOuSuggere.uidMembre}
                  value={candidatOuSuggere.uidMembre}
                >
                  {candidatOuSuggere.nom}
                </option>
              ))
            }
          </select>
          {
            informationsMembre === null ? (
              <div className={`fr-grid-row ${styles.informations}`}>
                <div className="fr-col-md-1">
                  <svg
                    height="20"
                    viewBox="0 0 20 20"
                    width="20"
                  >
                    <path
                      d="M17.5 0.5H2.5C1.39543 0.5 0.5 1.39543 0.5 2.5V17.5C0.5 18.6046 1.39543 19.5 2.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V2.5C19.5 1.39543 18.6046 0.5 17.5 0.5ZM11 5H9V7H11V5ZM11 9H9V15H11V9Z"
                      fill="#0063CB"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="fr-col-md-11 fr-mb-0">
                  <span className="font-weight-700">
                    Vous ne trouvez pas une collectivité/structure dans la liste ?
                  </span>
                  {' '}
                  <br />
                  Afin de récupérer leurs informations de contact, invitez les collectivités et structures qui n’ont pas
                  encore manifesté leur souhait de participer à compléter le formulaire disponible via ce lien :
                  {' '}
                  <ExternalLink
                    href="https://inclusion-numerique.anct.gouv.fr/gouvernance"
                    title="Invitez les collectivités et structures"
                  >
                    https://inclusion-numerique.anct.gouv.fr/gouvernance
                  </ExternalLink>
                </p>
              </div>
            ) : (
              <address>
                <Badge color="beige-gris-galet">
                  {informationsMembre.statut}
                </Badge>
                <div className="color-grey fr-mt-1w">
                  Numéro
                  {' '}
                  <abbr title="Système d’Identification du Répertoire des ÉTablissements">
                    SIRET
                  </abbr>
                  {/**/}
                  /
                  {/**/}
                  <abbr title="Répertoire d’Identification des Entreprises et des ÉTablissements">
                    RIDET
                  </abbr>
                </div>
                <div>
                  <ExternalLink
                    href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${informationsMembre.siret}`}
                    title={`Fiche ${informationsMembre.nom}`}
                  >
                    {informationsMembre.siret}
                  </ExternalLink>
                </div>
                <div className="color-grey fr-mt-1w">
                  Typologie
                </div>
                <div>
                  {informationsMembre.typologie}
                </div>
                <div className="color-grey fr-mt-1w">
                  Adresse
                </div>
                <div>
                  {informationsMembre.adresse}
                </div>
                <div className="color-grey fr-mt-1w">
                  Contact référent
                </div>
                <div>
                  {informationsMembre.contactReferent}
                </div>
              </address>
            )
          }
        </fieldset>
        <div className="fr-btns-group">
          <SubmitButton
            ariaControls={id}
            isDisabled={isDisabled}
          >
            {isDisabled && isAdded ? 'Ajout en cours...' : 'Ajouter'}
          </SubmitButton>
        </div>
      </form>
    </>
  )

  async function ajouterUnMembre(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)
    setIsAdded(true)
    const form = new FormData(event.currentTarget)
    const [membre] = form.values() as FormDataIterator<string>
    const messages = await accepterUnMembreAction({
      path: pathname,
      uidGouvernance,
      uidMembrePotentiel: membre,
    })
    if (messages.includes('OK')) {
      Notification('success', { description: 'ajouté', title: 'Membre ' })
    } else {
      Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
    }
    closeDrawer()
    setInformationsMembre(null);
    (event.target as HTMLFormElement).reset()
    setIsAdded(false)
  }

  function selectionnerUnMembre(event: FormEvent<HTMLSelectElement>): void {
    if (event.currentTarget.value === '') {
      setIsDisabled(true)
      setInformationsMembre(null)
    } else {
      setIsDisabled(false)
      setInformationsMembre(
        candidatsOuSuggeres
          .filter((candidatOuSuggere) => candidatOuSuggere.uidMembre === event.currentTarget.value)
          .map((membreSelectionne) => ({
            adresse: membreSelectionne.adresse,
            contactReferent: membreSelectionne.contactReferent,
            nom: membreSelectionne.nom,
            siret: membreSelectionne.siret,
            statut: membreSelectionne.statut,
            typologie: membreSelectionne.typologie,
            uidMembre: membreSelectionne.uidMembre,
          }))[0]
      )
    }
  }
}

type Props = Readonly<{
  id: string
  labelId: string
  candidatsOuSuggeres: MesMembresViewModel['candidatsOuSuggeres']
  uidGouvernance: string
  closeDrawer(): void
}>
