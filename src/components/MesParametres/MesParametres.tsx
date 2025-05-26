import { ReactElement, useId } from 'react'

import styles from './MesParametres.module.css'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import Toggle from '../shared/Toggle/Toggle'

export default function MesParametres(): ReactElement {
  const communicationEtNotificationsHeadingId = useId()
  const affichageHeadingId = useId()
  const modeClairRadioId = useId()
  const modeSombreRadioId = useId()
  // Stryker disable next-line BooleanLiteral
  const hasSeparator = true

  return (
    <div className="fr-grid-row fr-grid-row--center">
      <div>
        <PageTitle>
          <TitleIcon icon="settings-5-line" />
          Mes paramètres de compte
        </PageTitle>
        <p className="fr-text--sm color-grey">
          Retrouvez ici, vos préférences de communication et d’affichage.
        </p>
        <section
          aria-labelledby={communicationEtNotificationsHeadingId}
          className={`grey-border fr-p-4w fr-mb-4w ${styles.hidden}`}
        >
          <h2
            className="fr-h6"
            id={communicationEtNotificationsHeadingId}
          >
            Communication et notifications
          </h2>
          <Toggle
            hasSeparator={hasSeparator}
            name="recevoirNotifications"
          >
            Recevoir toutes les notifications sur votre adresse électronique
          </Toggle>
          <Toggle
            name="recevoirRecapitulatif"
          >
            Recevoir un récapitulatif hebdomadaire sur votre adresse électronique
          </Toggle>
        </section>
        <section
          aria-labelledby={affichageHeadingId}
          className="grey-border fr-p-4w fr-mb-4w fr-display"
        >
          <h2
            className="fr-h6"
            id={affichageHeadingId}
          >
            Affichage
          </h2>
          <fieldset className={`fr-segmented fr-segmented--md ${styles['fr-segmented']}`}>
            <legend className="fr-segmented__legend">
              Contraste de l’interface
            </legend>
            <div className={`fr-segmented__elements ${styles['fr-segmented__elements']}`}>
              <div className={`fr-segmented__element ${styles['fr-segmented__element']}`}>
                <input
                  className="fr-toggle__input fr-toggle-theme"
                  id={modeClairRadioId}
                  name="fr-radios-theme"
                  type="radio"
                  value="light"
                />
                <label
                  className="fr-icon-sun-line fr-label"
                  htmlFor={modeClairRadioId}
                >
                  Mode clair
                </label>
              </div>
              <div className={`fr-segmented__element ${styles['fr-segmented__element']}`}>
                <input
                  className="fr-toggle__input fr-toggle-theme"
                  id={modeSombreRadioId}
                  name="fr-radios-theme"
                  type="radio"
                  value="dark"
                />
                <label
                  className="fr-icon-moon-line fr-label"
                  htmlFor={modeSombreRadioId}
                >
                  Mode sombre
                </label>
              </div>
            </div>
          </fieldset>
        </section>
      </div>
    </div>
  )
}
