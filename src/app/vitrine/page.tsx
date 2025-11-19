import { Metadata } from 'next'
import Link from 'next/link'
import { ReactElement } from 'react'

import HeroSectionAccueil from '@/components/vitrine/HeroSection/HeroSectionAccueil'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'

export const metadata: Metadata = {
  description: 'Découvrez les dispositifs, lieux et outils pour favoriser l\'inclusion numérique sur les territoires. Accompagner tous les publics vers une utilisation autonome, sécurisée et confiante du numérique.',
  keywords: ['inclusion numérique', 'ANCT', 'France Numérique Ensemble', 'conseiller numérique', 'lieux d\'inclusion', 'gouvernance territoriale'],
  openGraph: {
    description: 'Découvrez les dispositifs, lieux et outils pour favoriser l\'inclusion numérique sur les territoires.',
    locale: 'fr_FR',
    title: 'Inclusion Numérique - Agence Nationale de la Cohésion des Territoires',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Inclusion Numérique - Agence Nationale de la Cohésion des Territoires',
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
              <p className="fr-text--md fr-mb-0">
                Le numérique est solidement ancré dans le quotidien d&apos;une grande partie de la population française.
              </p>
              <p className="fr-text--md fr-mb-0">
                Aujourd&apos;hui, plus de 9 Français sur 10 utilisent Internet et possèdent un smartphone*.
              </p>
              <p className="fr-text--md fr-mb-0">
                Pourtant, malgré la large diffusion de la connexion et des équipements, d&apos;importantes
                {' '}
                <strong>
                  inégalités numériques
                </strong>
                {' '}
                persistent dans notre société.
              </p> 
              <p className="fr-text--md fr-mb-0">
                On estime que près de
                {' '}
                <strong style={{ color: '#000091' }}>
                  16 millions de personnes en France sont éloignées du numérique.**
                </strong>
                {' '}
                Principalement, parce que ces personnes ne se sentent pas assez compétentes pour utiliser
                pleinement le numérique.
              </p>
              <p
                className="fr-text--sm fr-mb-0"
                style={{ color: '#666' }}
              >
                * Baromètre du numérique, 2024.
                <br />
                ** ANCT, CREDOC, Université Rennes 2 CREAD-M@rsouin, La société numérique française :
                définir et mesurer l&apos;éloignement numérique, 2023.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Approche renouvelée */}
      <section className="fr-py-1w">
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
              <p className="fr-text--md fr-mb-0">
                Concrètement, tous les individus ne sont pas en situation de tirer les mêmes profits
                des technologies numériques dans leur vie quotidienne. Loin d&apos;être une simple question d&apos;âge,
                cette capacité est fortement influencée par
                {' '}
                <strong style={{ color: '#000091' }}>
                  les conditions d&apos;existence des individus,
                </strong>
                {' '}
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
      <section className="fr-py-4w">
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
                  style={{ height: 'auto', marginTop: '2em', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <p className="fr-text--md fr-mb-0">
                Plus globalement, l&apos;éloignement numérique ne peut plus être considéré comme un
                simple enjeu technique ou technologique : il s&apos;agit d&apos;abord d&apos;un phénomène social.
              </p>
              <p className="fr-text--md">
                La prise en compte de ce phénomène dans sa complexité et son hétérogénéité ouvre des perspectives
                importantes pour déployer un numérique capacitant, source d&apos;émancipation pour toutes et tous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Comprendre et découvrir */}
      <section className="fr-py-4w">
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
              Comprendre et découvrir l&apos;inclusion numérique de proximité
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
                Plusieurs dispositifs existent pour accompagner la population : médiateurs numériques,
                ateliers de montée en compétences, actions d&apos;aller-vers ou encore
                programmes locaux portés par les collectivités. Ils permettent d&apos;accompagner tous les publics
                vers une utilisation plus autonome, sécurisée et confiante du numérique.
              </p>
              <div style={{ marginBottom: '2em' }}>
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
                de route territoriales, types d&apos;accompagnements proposés, profils et besoins
                des publics bénéficiaires. Ces analyses permettent de suivre et de mesurer les besoins
                de la population et d&apos;ajuster les stratégies locales d&apos;inclusion numérique.
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
              <div style={{ marginBottom: '8px', marginTop: '2em' }}>
                <img
                  alt="Icône Outiller"
                  src="/vitrine/accueil/icone-outiller.png"
                  style={{ height: 'auto', maxHeight: '56px', maxWidth: '56px', width: 'auto' }}
                />
              </div>
              <h3
                className="fr-h4"
                style={{ fontWeight: 700 }}
              >
                Les outils pour les professionnels de l&apos;inclusion numérique
              </h3>
              <p className="fr-text--md">
                Plusieurs outils permettent aux acteurs de l&apos;inclusion numérique de travailler efficacement.
                Parmi eux, Mon Inclusion Numérique constitue la suite d&apos;outil des porteurs de dispositifs
                d&apos;inclusion numérique. La Coop de la médiation est l&apos;outil métier des médiateurs numériques
                oeuvrant partout en France.
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
                  En tant qu&apos;acteur public ou privé de l&apos;inclusion numérique,
                </strong>
                {' '}
                vous êtes invités à rejoindre
                la dynamique de votre territoire en rejoignant la gouvernance France Numérique Ensemble
                de votre département. Vous pourrez ainsi porter ou contribuer à des actions pensées
                et mises en oeuvre de façon collégiale.
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

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
