import { ReactElement } from 'react'

import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import { DetailsUtilisateurViewModel } from '@/presenters/mesUtilisateursPresenter'

export default function DetailsUtilisateur({ utilisateur, labelId }: Props): ReactElement {
  const donneesPersonnelles: ReadonlyArray<DetailUtilisateur> = [
    {
      label: 'Rôle attribué',
      value: utilisateur.role,
    },
    {
      label: 'Adresse électronique',
      value: utilisateur.emailDeContact,
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
      <DrawerTitle id={labelId}>
        {utilisateur.prenomEtNom}
      </DrawerTitle>
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

type Props = Readonly<{
  utilisateur: DetailsUtilisateurViewModel,
  labelId: string,
}>

type DetailUtilisateur = Readonly<{
  label: string,
  value: string
}>
