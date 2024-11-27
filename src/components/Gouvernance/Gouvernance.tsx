import { ReactElement } from 'react'

import styles from './Gouvernance.module.css'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import Title from '../shared/Title/Title'

export default function Gouvernance({ gouvernanceViewModel }: GouvernanceProps): ReactElement {
  return (
    <>
      <Title icon="compass-3-line">
        Inclusion numérique ·
        {' '}
        {gouvernanceViewModel.departement}
      </Title>
      <p>
        Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.
      </p>
      <section aria-labelledby="comitologie">
        <header>
          <h2
            className="color-blue-france"
            id="comitologie"
          >
            Comitologie
          </h2>
        </header>
        <article className={`icon-title fr-p-6w fr-mb-4w ${styles.center}`}>
          <p className="fr-h6">
            Actuellement, vous n’avez pas de comité
          </p>
          <p>
            Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.
          </p>
          <button
            className="fr-btn fr-btn--icon-left fr-icon-add-line"
            type="button"
          >
            Ajouter un comité
          </button>
        </article>
      </section>
      <section aria-labelledby="membre">
        <header>
          <h2
            className="color-blue-france"
            id="membre"
          >
            0 membre
          </h2>
        </header>
        <article className={`icon-title fr-p-6w fr-mb-4w ${styles.center}`}>
          <p className="fr-h6">
            Actuellement, il n’y a aucun membre dans la gouvernance
          </p>
          <p>
            Vous pouvez inviter les collectivités et structures qui n’ont pas encore manifesté leur souhait
            de participer et/ou de porter une feuille de route territoriale en leur partageant
            ce lien vers les formulaires prévus à cet effet :
            <br />
            <ExternalLink
              href="https://inclusion-numerique.anct.gouv.fr/gouvernance"
              title="Formulaire d’invitation à la gouvernance"
            >
              https://inclusion-numerique.anct.gouv.fr/gouvernance
            </ExternalLink>
          </p>
          <button
            className="fr-btn fr-btn--icon-left fr-icon-add-line"
            type="button"
          >
            Ajouter des membres
          </button>
        </article>
      </section>
      <section aria-labelledby="feuilleDeRoute">
        <header>
          <h2
            className="color-blue-france"
            id="feuilleDeRoute"
          >
            0 feuille de route
          </h2>
        </header>
        <article className={`icon-title fr-p-6w fr-mb-4w ${styles.center}`}>
          <p className="fr-h6">
            Aucune feuille de route
          </p>
          <p>
            Commencez par créer des porteurs au sein de la gouvernance pour définir votre première feuille de route.
          </p>
          <button
            className="fr-btn fr-btn--icon-left fr-icon-add-line"
            type="button"
          >
            Ajouter une feuille de route
          </button>
        </article>
      </section>
      <section aria-labelledby="noteDeContexte">
        <header>
          <h2
            className="color-blue-france"
            id="noteDeContexte"
          >
            Note de contexte
          </h2>
        </header>
        <article className={`icon-title fr-p-6w fr-mb-4w ${styles.center}`}>
          <p className="fr-h6">
            Aucune note de contexte
          </p>
          <p>
            Précisez, au sein d’une note qualitative, les spécificités de votre démarche,
            les éventuelles difficultés que vous rencontrez, ou tout autre élément
            que vous souhaitez porter à notre connaissance.
          </p>
          <button
            className="fr-btn fr-btn--icon-left fr-icon-add-line"
            type="button"
          >
            Ajouter une note de contexte
          </button>
        </article>
      </section>
    </>
  )
}

type GouvernanceProps = Readonly<{
  gouvernanceViewModel: Readonly<{ departement: string }>
}>
