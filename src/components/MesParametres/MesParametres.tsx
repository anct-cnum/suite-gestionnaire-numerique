import { ReactElement, useId } from 'react'

import styles from './MesParametres.module.css'

export default function MesParametres(): ReactElement {

  const communicationEtNotificationsHeadingId = useId()
  const recevoirNotificationsToggleId = useId()
  const recevoirRecapHebdoToggleId = useId()
  const affichageHeadingId = useId()
  const modeClairRadioId = useId()
  const modeSombreRadioId = useId()

  return (
    <>
      <h1 className="color-blue-france">
        <span
          aria-hidden="true"
          className={'fr-icon-settings-5-line icon-title fr-mr-3w'}
        />
        {/**/}
        Mes paramètres de compte
      </h1>
      <p className="fr-text--sm color-grey">
        Retrouvez ici, vos préférences de communication et d’affichage.
      </p>
      <section
        aria-labelledby={communicationEtNotificationsHeadingId}
        className="fr-card fr-p-4w fr-mb-4w"
      >
        <h2
          className="fr-h6"
          id={communicationEtNotificationsHeadingId}
        >
          Communication et notifications
        </h2>
        <div className={`fr-toggle fr-pb-2w ${styles['fr-toggle--bb']}`}>
          <input
            aria-describedby={`${recevoirNotificationsToggleId}-messages`}
            className="fr-toggle__input"
            id={recevoirNotificationsToggleId}
            type="checkbox"
          />
          <label
            className="fr-toggle__label"
            htmlFor={recevoirNotificationsToggleId}
          >
            Recevoir toutes les notifications sur votre adresse électronique
          </label>
          <div
            aria-live="polite"
            className="fr-messages-group"
            id={`${recevoirNotificationsToggleId}-messages`}
          />
        </div>
        <div className="fr-toggle fr-pb-4w fr-mt-2w">
          <input
            aria-describedby={`${recevoirRecapHebdoToggleId}-messages`}
            className="fr-toggle__input"
            id={recevoirRecapHebdoToggleId}
            type="checkbox"
          />
          <label
            className="fr-toggle__label"
            htmlFor={recevoirRecapHebdoToggleId}
          >
            Recevoir un récapitulatif hebdomadaire sur votre adresse électronique
          </label>
          <div
            aria-live="polite"
            className="fr-messages-group"
            id={`${recevoirRecapHebdoToggleId}-messages`}
          />
        </div>
        <div className="fr-grid-row fr-grid-row--center fr-grid-row--gutters" />
      </section>
      <section
        aria-labelledby={affichageHeadingId}
        className="fr-card fr-p-4w fr-mb-4w fr-display"
      >
        <h2
          className="fr-h6"
          id={affichageHeadingId}
        >
          Affichage
        </h2>
        <fieldset className="fr-segmented fr-segmented--md">
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
    </>
  )
}
