import { ReactElement } from 'react'

import ReadMoreVitrine from './ReadMoreVitrine'
import DrawerTitle from '../../shared/DrawerTitle/DrawerTitle'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function DetailActionVitrine({ action, labelId }: Props): ReactElement {
  return (
    <div className="fr-px-10w fr-pt-10w fr-pb-14w">
      <DrawerTitle id={labelId}>
        <TitleIcon
          background={action.statut.background}
          icon={action.statut.icon}
        />
        <br />
        {action.nom}
      </DrawerTitle>
      {Object.keys(action.besoins).length > 0 && (
        <p className="fr-text--sm color-grey fr-text--bold">
          {Object.entries(action.besoins)[0]?.[1]}
        </p>
      )}

      <div className="color-grey fr-mt-6w fr-mb-2w">
        Porteur de l&apos;action
      </div>
      {action.porteurs.length === 0 ? (
        <span className="fr-text--bold">
          -
        </span>
      ) : (
        <ul className="fr-tags-group">
          {action.porteurs.map((porteur) => (
            <li key={porteur.link}>
              <p className="fr-tag">
                {porteur.label}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="color-grey fr-mt-6w fr-mb-2w">
        Budget total de l&apos;action
      </div>
      <p className="fr-text--bold">
        {action.budgetPrevisionnel.global.montant}
      </p>

      {action.description.length > 0 && (
        <>
          <div className="color-grey fr-text--bold fr-mt-6w fr-mb-2w">
            Contexte de l&apos;action
          </div>
          <ReadMoreVitrine texte={action.description} />
        </>
      )}

      {action.description.length > 0 && (
        <>
          <div className="color-grey fr-mt-6w fr-mb-2w">
            Description de l&apos;action
          </div>
          <ReadMoreVitrine texte={action.description} />
        </>
      )}

      <div className="color-grey fr-mt-6w fr-mb-2w">
        Bénéficiaires des subventions
      </div>
      {action.beneficiaires.length === 0 ? (
        <span className="fr-text--bold">
          -
        </span>
      ) : (
        <ul className="fr-tags-group">
          {action.beneficiaires.map((beneficiaire) => (
            <li key={beneficiaire.link}>
              <p className="fr-tag">
                {beneficiaire.label}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

type Props = Readonly<{
  action: FeuilleDeRouteViewModel['actions'][number]
  labelId: string
}>
