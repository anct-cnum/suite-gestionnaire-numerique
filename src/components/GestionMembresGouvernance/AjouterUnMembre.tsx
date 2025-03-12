import { FormEvent, ReactElement, useContext, useState } from 'react'

import Badge from '../shared/Badge/Badge'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import { Notification } from '../shared/Notification/Notification'
import Select from '../shared/Select/Select'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { MembreViewModel } from '@/presenters/membresPresenter'
import { isEmpty } from '@/shared/lang'

export default function AjouterUnMembre({
  closeDrawer,
  id,
  labelId,
  candidatsEtSuggeres,
  uidGouvernance,
}: Props): ReactElement {
  const { accepterUnMembreAction, pathname } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(true)
  const [informationsMembre, setInformationsMembre] = useState<MembreViewModel | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const membresByUid = candidatsEtSuggeres.reduce<Readonly<Record<string, MembreViewModel>>>(
    (byUid, membre) => Object.assign(byUid, { [membre.uid]: membre }), {}
  )

  return (
    <>
      <DrawerTitle id={labelId}>
        <TitleIcon icon="community-line" />
        <br />
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
          <Select
            id="membres"
            isPlaceholderSelectable={true}
            name="membre"
            onChange={selectionnerUnMembre}
            options={candidatsEtSuggeres.map(({ nom, uid }) => ({ id: 'uid', isSelected: false, label: nom, value: uid }))}
            placeholder="Sélectionner un membre"
            required={true}
          >
            Membre candidat ou suggéré
          </Select>
          {
            informationsMembre === null ? (
              <div className="fr-grid-row background-info fr-p-4w">
                <div className="fr-col-md-1">
                  <InformationLogo />
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
                    className="color-blue-france"
                    href="https://inclusion-numerique.anct.gouv.fr/gouvernance"
                    title="Invitez les collectivités et structures"
                  >
                    https://inclusion-numerique.anct.gouv.fr/gouvernance
                  </ExternalLink>
                </p>
              </div>
            ) : (
              <address>
                <Badge color="new">
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
                  {informationsMembre.typologie.elaboree.label}
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
                  {informationsMembre.contactReferent.intitule}
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
    const uidMembre = event.currentTarget.value
    if (isEmpty(uidMembre)) {
      setIsDisabled(true)
      setInformationsMembre(null)
    } else {
      setIsDisabled(false)
      setInformationsMembre(membresByUid[uidMembre])
    }
  }
}

type Props = Readonly<{
  id: string
  labelId: string
  candidatsEtSuggeres: ReadonlyArray<MembreViewModel>
  uidGouvernance: string
  closeDrawer(): void
}>
