import { ReactElement } from 'react'

import { MonUtilisateur } from '../../presenters/mesUtilisateursPresenter'

export default function DetailsUtilisateur({ utilisateur }: DetailsUtilisateurProps): ReactElement {
  const donneesPersonnelles = [
    {
      label: 'Rôle attribué',
      value: utilisateur.role,
    },
    {
      label: 'Adresse éléctronique',
      value: utilisateur.email,
    },
    {
      label: 'Téléphone professionnel',
      value: utilisateur.telephone,
    },
    {
      label: 'Dernière connexion',
      value: utilisateur.derniereConnexion,
    },
    {
      label: 'Structure ou collectivité',
      value: utilisateur.structure,
    },
  ]

  return (
    <div>
      <h1 className="fr-h2 color-blue-france">
        {utilisateur.prenomEtNom}
      </h1>
      {donneesPersonnelles.map(({ label, value }) => (
        <div
          className="fr-mb-2w"
          key={label}
        >
          <div className="color-grey">
            {label}
          </div>
          <div className="font-weight-700">
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}

type DetailsUtilisateurProps = Readonly<{
  utilisateur: MonUtilisateur
}>
