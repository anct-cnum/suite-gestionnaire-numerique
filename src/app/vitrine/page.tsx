import { Metadata } from 'next'
import Link from 'next/link'
import { ReactElement } from 'react'

import HeroSectionAccueil from '@/components/vitrine/HeroSection/HeroSectionAccueil'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function VitrineHomePage(): ReactElement {
  return (
    <>
      {/* Hero Section */}
      <HeroSectionAccueil />

      {/* Section Enjeu */}
      <section className="fr-py-12w">
        <div className="fr-container">
          {/* Titre principal */}
          <div
            className="fr-mb-8w"
            style={{ margin: '0 auto', maxWidth: '960px' }}
          >
            <h2
              style={{
                color: '#000091',
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '56px',
                textAlign: 'center',
              }}
            >
              Quel enjeu pour l&apos;inclusion numérique aujourd&apos;hui en France ?
            </h2>
          </div>

          {/* Bloc 1 : Inégalités (Image gauche / Texte droite) */}
          <div
            className="fr-grid-row fr-mb-6w"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Inégalités numériques"
                src="/vitrine/accueil/illustration-inegalites.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h3 className="fr-h4 fr-mb-0">
                Des inégalités numériques persistantes dans notre société
              </h3>
              <p className="fr-text--md">
                Le numérique est solidement ancré dans le quotidien d&apos;une grande partie de la population française.
              </p>
              <p className="fr-text--md">
                Aujourd&apos;hui, plus de 9 Français sur 10 utilisent Internet et possèdent un smartphone*.
              </p>
              <p className="fr-text--md">
                Pourtant, malgré la large diffusion de la connexion et des équipements, d&apos;importantes
                {' '}
                <strong>
                  inégalités numériques
                </strong>
                {' '}
                persistent dans notre société.
              </p>
              <p className="fr-text--md">
                On estime que près de
                {' '}
                <strong style={{ color: '#000091' }}>
                  16 millions de personnes en France sont éloignées du numérique**
                </strong>
                {'. '}
                Principalement, parce que ces personnes ne se sentent pas assez compétentes pour utiliser
                pleinement le numérique.
              </p>
              <p
                className="fr-text--sm"
                style={{ color: '#666' }}
              >
                * Baromètre du numérique, 2024.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Approche renouvelée */}
      <section className="fr-py-12w">
        <div className="fr-container">
          {/* Bloc 2 : Approche renouvelée (Texte gauche / Image droite) */}
          <div
            className="fr-grid-row fr-mb-6w"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2 className="fr-h2 fr-mb-0">
                Une approche renouvelée de l&apos;inclusion numérique
              </h2>
              <p className="fr-text--md">
                Concrètement, tous les individus ne sont pas en situation de tirer les mêmes profits
                des technologies numériques dans leur vie quotidienne. Loin d&apos;être une simple question d&apos;âge,
                cette capacité est fortement influencée par
                {' '}
                <strong style={{ color: '#000091' }}>
                  les conditions d&apos;existence des individus
                </strong>
                {', '}
                en particulier leur niveau d&apos;étude.
              </p>
              <p className="fr-text--md">
                A ce titre, plus de
                {' '}
                <strong style={{ color: '#000091' }}>
                  60 % des Français non-diplômés*
                </strong>
                {' '}
                estiment que le numérique complique ou n&apos;a pas d&apos;effet sur leur vie quotidienne.
              </p>
              <p
                className="fr-text--sm"
                style={{ color: '#666' }}
              >
                ** ANCT, CREDOC, Université Rennes 2 CREAD-M@rsouin, La société numérique française :
                définir et mesurer l&apos;éloignement numérique, 2023.
              </p>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Approche renouvelée"
                src="/vitrine/accueil/illustration-approche.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Permettre à tous */}
      <section className="fr-py-12w">
        <div className="fr-container">
          {/* Bloc 3 : Permettre à tous (Texte gauche / Texte+Icône droite) */}
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <p className="fr-text--md">
                Ici réside désormais l&apos;enjeu de l&apos;inclusion numérique :
              </p>
              <h2
                className="fr-h2 fr-mb-0"
              >
                Permettre à toutes, tous, sans distinction, d&apos;utiliser le numérique pour accroître son
                bien-être et favoriser son pouvoir d&apos;agir dans la société.
              </h2>
            </div>
            <div
              className="fr-col-12 fr-col-md-6"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <div>
                <img
                  alt="Développer formations"
                  src="/vitrine/accueil/icone-developper-formations.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <p className="fr-text--md">
                Plus globalement, l&apos;éloignement numérique ne peut plus être considéré comme un
                simple enjeu technique ou technologique : il s&apos;agit d&apos;abord d&apos;un phénomène social.
              </p>
              <p className="fr-text--md">
                La prise en compte de ce phénomène dans sa complexité et son hétérogénéité ouvre des perspectives
                importantes pour la construction de politiques d&apos;inclusion numérique différenciées en fonction
                des publics et des territoires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Comprendre et découvrir */}
      <section className="fr-py-12w">
        <div className="fr-container">
          {/* Icône et titre centré */}
          <div
            className="fr-mb-4w"
            style={{ textAlign: 'center' }}
          >
            <img
              alt="Accompagner acteurs"
              src="/vitrine/accueil/icone-accompagner-acteurs.png"
              style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
            />
          </div>
          <div
            className="fr-mb-8w"
            style={{ margin: '0 auto', maxWidth: '960px' }}
          >
            <h2
              style={{
                color: '#000091',
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '56px',
                textAlign: 'center',
              }}
            >
              Comprendre et découvrir l&apos;inclusion numérique dans les territoires
            </h2>
          </div>

          {/* Ligne 1 : Lieux (Texte gauche / Image droite) */}
          <div
            className="fr-grid-row fr-mb-6w"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <img
                  alt="Icône Territorialiser"
                  src="/vitrine/accueil/icone-territorialiser.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <h3
                className="fr-h4 fr-mb-0"
                style={{ fontWeight: 700 }}
              >
                Les lieux d&apos;inclusion numérique sur le territoire
              </h3>
              <p className="fr-text--md">
                Partout en France, des milliers de lieux accompagnent les habitants dans leurs usages du numérique :
                médiathèques, centres sociaux, tiers-lieux, espaces France Services ou associations locales.
                Ces structures proposent des ateliers, des permanences et un accueil de proximité pour répondre
                aux besoins de chacun.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="/vitrine/lieux"
                >
                  La cartographie nationale
                </Link>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Lieux d'inclusion"
                src="/vitrine/accueil/illustration-lieux-inclusions.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>

          {/* Ligne 2 : Dispositifs (Image gauche / Texte droite) */}
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', order: 2 }}
            >
              <div style={{ marginBottom: '8px' }}>
                <img
                  alt="Icône Former acteurs"
                  src="/vitrine/accueil/icone-former-acteurs.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <h3
                className="fr-h4 fr-mb-0"
                style={{ fontWeight: 700 }}
              >
                Les dispositifs de l&apos;inclusion numérique
              </h3>
              <p className="fr-text--md">
                Plusieurs dispositifs existent pour soutenir les citoyens : conseillers numériques,
                pass numériques, ateliers de montée en compétences, actions d&apos;aller-vers ou encore
                programmes locaux portés par les collectivités. Ils permettent d&apos;accompagner tous les publics
                vers une utilisation plus autonome, sécurisée et confiante du numérique.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="/vitrine/dispositifs"
                >
                  Les dispositifs d&apos;inclusion numérique
                </Link>
              </div>
            </div>
            <div
              className="fr-col-12 fr-col-md-6"
              style={{ order: 1 }}
            >
              <img
                alt="Dispositifs"
                src="/vitrine/accueil/illustration-dispositifs.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>

          {/* Ligne 3 : Données (Texte gauche / Image droite) */}
          <div
            className="fr-grid-row fr-mb-6w"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <img
                  alt="Icône Évaluer"
                  src="/vitrine/accueil/icone-evaluer.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <h3
                className="fr-h4 fr-mb-0"
                style={{ fontWeight: 700 }}
              >
                Les données et les études de l&apos;inclusion numérique
              </h3>
              <p className="fr-text--md">
                Accédez aux données qui éclairent les dynamiques locales : actions mises en œuvre dans les feuilles
                de route territoriales, types d&apos;accompagnements proposés, profils des publics et statistiques.
                Ces analyses permettent de suivre et d&apos;évaluer les besoins et d&apos;ajuster les stratégies
                à l&apos;échelle de chaque territoire.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="/vitrine/donnees-territoriales"
                >
                  Choisir un territoire
                </Link>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Données et études"
                src="/vitrine/accueil/illustration-donnees.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>

          {/* Ligne 4 : Outils (Image gauche / Texte droite) */}
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '8px', order: 2 }}
            >
              <div style={{ marginBottom: '8px' }}>
                <img
                  alt="Icône Outiller"
                  src="/vitrine/accueil/icone-outiller.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <h3
                className="fr-h4 fr-mb-0"
                style={{ fontWeight: 700 }}
              >
                Les outils pour les professionnels de l&apos;inclusion numérique
              </h3>
              <p className="fr-text--md">
                Pour aider les acteurs à mieux travailler ensemble, deux outils sont disponibles :
                Mon Inclusion Numérique, pour les collectivités qui pilotent les actions sur leur territoire,
                et La Coop de la médiation numérique, pour les médiateurs qui suivent leurs accompagnements
                et utilisent des ressources utiles. Ces outils rendent la coordination plus simple.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="/vitrine/outils-numeriques"
                >
                  Découvrir les outils
                </Link>
              </div>
            </div>
            <div
              className="fr-col-12 fr-col-md-6"
              style={{ order: 1 }}
            >
              <img
                alt="Outils"
                src="/vitrine/accueil/illustration-outils.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section Gouvernance */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#fff8e1' }}
      >
        <div className="fr-container">
          <div
            className="fr-grid-row"
            style={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div className="fr-col-12 fr-col-md-6">
              <img
                alt="Participer à une gouvernance"
                src="/vitrine/accueil/illustration-participer.png"
                style={{ height: 'auto', width: '100%' }}
              />
            </div>
            <div
              className="fr-col-12 fr-col-md-5"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <h2
                style={{
                  color: '#000091',
                  fontSize: '40px',
                  fontWeight: 700,
                  lineHeight: '48px',
                }}
              >
                Comment participer à une gouvernance territoriale ?
              </h2>
              <p className="fr-text--md">
                <strong>
                  En tant que collectivité ou acteur territorial
                </strong>
                {', '}
                vous êtes invité à manifester votre souhait
                de participer à une gouvernance de l&apos;inclusion numérique sur votre territoire.
                En tant que Conseil Régional, Conseil Département ou EPCI, vous pouvez également porter
                une feuille de route.
              </p>
              <div>
                <Link
                  className="fr-btn"
                  href="#"
                >
                  Accéder à la plateforme
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Questions fréquentes */}
      <section className="fr-py-12w">
        <div className="fr-container">
          <h2 className="fr-h2 fr-mb-6w fr-text--center">
            Questions fréquentes
          </h2>
          <div className="fr-accordions-group">
            <section className="fr-accordion">
              <h3 className="fr-accordion__title">
                <button
                  aria-controls="accordion-1"
                  aria-expanded="false"
                  className="fr-accordion__btn"
                  type="button"
                >
                  Qui peut utiliser La Coop de la médiation numérique ?
                </button>
              </h3>
              <div
                className="fr-collapse"
                id="accordion-1"
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </section>

            <section className="fr-accordion">
              <h3 className="fr-accordion__title">
                <button
                  aria-controls="accordion-2"
                  aria-expanded="false"
                  className="fr-accordion__btn"
                  type="button"
                >
                  Comment créer mon compte sur La Coop de la médiation numérique ?
                </button>
              </h3>
              <div
                className="fr-collapse"
                id="accordion-2"
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </section>

            <section className="fr-accordion">
              <h3 className="fr-accordion__title">
                <button
                  aria-controls="accordion-3"
                  aria-expanded="false"
                  className="fr-accordion__btn"
                  type="button"
                >
                  Qui utilise les données collectés sur La Coop de la médiation numérique et pourquoi ?
                </button>
              </h3>
              <div
                className="fr-collapse"
                id="accordion-3"
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </section>

            <section className="fr-accordion">
              <h3 className="fr-accordion__title">
                <button
                  aria-controls="accordion-4"
                  aria-expanded="false"
                  className="fr-accordion__btn"
                  type="button"
                >
                  Pourquoi et comment exporter mes statistiques d&apos;activité ?
                </button>
              </h3>
              <div
                className="fr-collapse"
                id="accordion-4"
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </section>

            <section className="fr-accordion">
              <h3 className="fr-accordion__title">
                <button
                  aria-controls="accordion-5"
                  aria-expanded="false"
                  className="fr-accordion__btn"
                  type="button"
                >
                  Comment j&apos;accède aux différents outils disponibles sur la plateforme ?
                </button>
              </h3>
              <div
                className="fr-collapse"
                id="accordion-5"
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* Section Qui sommes-nous */}
      <section
        className="fr-py-12w"
        style={{ backgroundColor: '#f5f5fe' }}
      >
        <div className="fr-container">
          <div className="fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-10">
              {/* Logos RF + ANCT */}
              <div
                className="fr-mb-6w"
                style={{ textAlign: 'center' }}
              >
                <img
                  alt="République Française - ANCT Société Numérique"
                  src="/vitrine/accueil/logo-rf-anct.png"
                  style={{
                    display: 'inline-block',
                    height: 'auto',
                    maxWidth: '384px',
                    width: '100%',
                  }}
                />
              </div>

              {/* Titre */}
              <h2
                className="fr-h2 fr-mb-6w"
                style={{ color: '#000091', textAlign: 'center' }}
              >
                Qui sommes nous ?
              </h2>

              {/* Paragraphes avec liens */}
              <p
                className="fr-text--md fr-mb-4w"
                style={{ textAlign: 'center' }}
              >
                Nous sommes l&apos;équipe du
                {' '}
                <a
                  className="fr-link"
                  href="https://societenumerique.gouv.fr/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Programme Société Numérique
                </a>
                {' '}
                qui porte la politique nationale d&apos;inclusion numérique, formalisée par une feuille
                de route co-écrite avec l&apos;ensemble des acteurs du secteur :
                {' '}
                <a
                  className="fr-link"
                  href="https://www.societenumerique.gouv.fr/nos-missions/france-numerique-ensemble"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  France Numérique Ensemble
                </a>
                {' '}
                .

              </p>
              <p
                className="fr-text--md fr-mb-4w"
                style={{ textAlign: 'center' }}
              >
                Le programme œuvre pour le développement d&apos;un numérique d&apos;intérêt
                général qui ambitionne d&apos;être ouvert, éthique, durable, souverain et,
                bien sûr, inclusif.
              </p>
              <p
                className="fr-text--md"
                style={{ textAlign: 'center' }}
              >
                Nous suivons l&apos;approche
                {' '}
                <a
                  className="fr-link"
                  href="https://beta.gouv.fr/approche"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  beta.gouv.fr
                </a>
                {' '}
                qui place l&apos;expérience utilisateur au coeur de la conception produit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
