import { Dispatch, FormEvent, ReactElement, SetStateAction, useId, useState } from 'react'

import { modifierMesInformationsPersonnellesAction } from '../../app/api/actions/modifierMesInformationsPersonnellesAction'
import Input from '../shared/Input/Input'

export default function ModifierMonCompte({
  email,
  id,
  labelId,
  nom,
  prenom,
  setIsOpen,
  telephone,
}: ModifierMonCompteProps): ReactElement {
  const [etatBoutonEnregistrer, setEtatBoutonEnregistrer] = useState({
    enAttente: false,
    texte: 'Enregistrer',
  })
  const nomId = useId()
  const prenomId = useId()
  const emailId = useId()
  const telephoneId = useId()

  return (
    <>
      <h1
        className="fr-h3 color-blue-france"
        id={labelId}
      >
        Mes informations personnelles
      </h1>
      <p>
        Les champs avec
        {' '}
        <span className="color-red">
          *
        </span>
        {' '}
        sont obligatoires.
      </p>
      <form
        aria-label="Modifier"
        method="dialog"
        onSubmit={modifierMesInfosPersos}
      >
        <Input
          defaultValue={nom}
          id={nomId}
          name="nom"
          required={true}
        >
          Nom
          {' '}
          <span className="color-red">
            *
          </span>
        </Input>
        <Input
          defaultValue={prenom}
          id={prenomId}
          name="prenom"
          required={true}
        >
          Prénom
          {' '}
          <span className="color-red">
            *
          </span>
        </Input>
        <Input
          defaultValue={email}
          id={emailId}
          name="email"
          pattern=".+@.+\..{2,}"
          required={true}
          type="email"
        >
          Adresse électronique
          {' '}
          <span className="color-red">
            *
          </span>
          {' '}
          <span className="fr-hint-text">
            Seuls les gestionnaires verront votre adresse électronique.
          </span>
        </Input>
        <Input
          defaultValue={telephone.replaceAll(' ', '')}
          id={telephoneId}
          name="telephone"
          pattern="0[0-9]{9}"
          required={false}
          type="tel"
        >
          Téléphone professionnel
          {' '}
          <span className="fr-hint-text">
            Seuls les gestionnaires verront votre numéro de téléphone.
            Format attendu : 0122334455
          </span>
        </Input>
        <div className="fr-btns-group fr-btns-group--center">
          <button
            aria-controls={id}
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={() => {
              setIsOpen(false)
            }}
            type="button"
          >
            Annuler
          </button>
          <button
            className="fr-btn fr-col-5"
            disabled={etatBoutonEnregistrer.enAttente}
            type="submit"
          >
            {etatBoutonEnregistrer.texte}
          </button>
        </div>
      </form>
    </>
  )

  async function modifierMesInfosPersos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const nom = form.get('nom') as string
    const prenom = form.get('prenom') as string
    const email = form.get('email') as string
    const telephone = form.get('telephone') as string

    await modifierMesInformationsPersonnellesAction(email, nom, prenom, telephone)
      .then(() => {
        setEtatBoutonEnregistrer({
          enAttente: true,
          texte: 'Modification en cours',
        })

        window.location.reload()
      })
  }
}

type ModifierMonCompteProps = Readonly<{
  email: string
  id: string
  labelId: string
  nom: string
  prenom: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
  telephone: string
}>
