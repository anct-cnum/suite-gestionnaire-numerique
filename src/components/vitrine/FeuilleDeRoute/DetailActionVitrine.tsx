import { ReactElement } from 'react'

import ReadMoreVitrine from './ReadMoreVitrine'
import DrawerTitle from '../../shared/DrawerTitle/DrawerTitle'
import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import { FeuilleDeRouteViewModel } from '@/presenters/feuillesDeRoutePresenter'

export default function DetailActionVitrine({ action, labelId }: Props): ReactElement {
  return (
    <div className="fr-pb-4w">
      <DrawerTitle id={labelId}>
        <TitleIcon background={action.statut.background} icon={action.statut.icon} />
        <br />
        {action.nom}
      </DrawerTitle>
      {Object.keys(action.besoins).length > 0 && (
        <p className="fr-text--sm color-grey fr-text--bold">{Object.entries(action.besoins)[0]?.[1]}</p>
      )}

      <dl className="fr-raw-list">
        <dt className="color-grey fr-mt-2w fr-mb-1w">Porteur de l&apos;action</dt>
        <dd>
          {action.porteurs.length === 0 ? (
            <span className="fr-text--bold">-</span>
          ) : (
            <ul className="fr-tags-group">
              {action.porteurs.map((porteur) => (
                <li key={porteur.link}>
                  <p className="fr-tag">{porteur.label}</p>
                </li>
              ))}
            </ul>
          )}
        </dd>

        <dt className="color-grey fr-mt-2w fr-mb-1w">Budget total de l&apos;action</dt>
        <dd>
          <p className="fr-text--bold">{action.budgetPrevisionnel.global.montant}</p>
        </dd>

        {action.description.length > 0 && (
          <>
            <dt className="color-grey fr-mt-2w fr-mb-1w">Description de l&apos;action</dt>
            <dd>
              <ReadMoreVitrine texte={action.description} />
            </dd>
          </>
        )}

        <dt className="color-grey fr-mt-2w fr-mb-1w">Bénéficiaires des subventions</dt>
        <dd>
          {action.beneficiaires.length === 0 ? (
            <span className="fr-text--bold">-</span>
          ) : (
            <ul className="fr-tags-group">
              {action.beneficiaires.map((beneficiaire) => (
                <li key={beneficiaire.link}>
                  <p className="fr-tag">{beneficiaire.label}</p>
                </li>
              ))}
            </ul>
          )}
        </dd>
      </dl>
    </div>
  )
}

type Props = Readonly<{
  action: FeuilleDeRouteViewModel['actions'][number]
  labelId: string
}>
