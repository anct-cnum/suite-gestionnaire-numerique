import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import ToolCard from '@/components/vitrine/ToolCard/ToolCard'

export const metadata: Metadata = {
  description: 'Découvrez les outils numériques pour piloter l\'inclusion numérique : Mon Inclusion Numérique, cartographie nationale, données territoriales et outils de pilotage.',
  keywords: ['outils numériques', 'Mon Inclusion Numérique', 'pilotage', 'données territoriales', 'cartographie nationale'],
  openGraph: {
    description: 'Découvrez les outils numériques pour piloter l\'inclusion numérique sur les territoires.',
    locale: 'fr_FR',
    title: 'Outils numériques - Inclusion Numérique',
    type: 'website',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: 'Outils numériques - Inclusion Numérique',
}

export default function OutilsNumeriquesPage(): ReactElement {
  return (
    <>
      <HeroSection
        backgroundImage="/vitrine/outils/hero.png"
        subtitle="Des outils pour échanger, piloter, accompagner"
        title="Les outils professionnels de l'inclusion numérique"
      />

      {/* Mon inclusion Numérique */}
      <ToolCard
        description="Mon Inclusion Numérique est une suite d'outils pensée par et pour les gestionnaires de la politique d'inclusion numérique qui propose une mise en cohérence des différents dispositifs."
        icon="/vitrine/outils/icon-min.png"
        imageAlt="Capture d'écran de Mon inclusion Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-min.png"
        link="/vitrine/outils-numeriques/min"
        title="Mon inclusion Numérique"
      />

      {/* La Coop de la Médiation */}
      <ToolCard
        description="La Coop facilite le suivi de vos accompagnements et de vos bénéficiaires et vous permet de valoriser votre activité facilement en générant des statistiques et compte-rendus clés en main."
        icon="/vitrine/outils/icon-coop.png"
        imageAlt="Capture d'écran de La Coop de la Médiation"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-coop.png"
        link="https://coop-numerique.anct.gouv.fr/"
        title="La Coop de la médiation numérique"
      />

      {/* Les bases du numérique d'intérêt général */}
      <ToolCard
        description="Les Bases est une plateforme collaborative nationale de partage de ressources, de supports pédagogiques et de communs numériques, accessible et ouverte à toutes et tous."
        icon="/vitrine/outils/icon-bases.png"
        imageAlt="Capture d'écran des bases du numérique d'intérêt général"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-bases.png"
        link="https://lesbases.anct.gouv.fr/"
        title="Les Bases du numérique d'intérêt général"
      />

      {/* La cartographie des lieux d'inclusion */}
      <ToolCard
        description="Que vous soyez un particulier ou un professionnel, la cartographie nationale est là pour vous aider à trouver les lieux d'inclusion numérique avec des services adaptés à vos besoins ou à ceux de vos bénéficiaires !"
        icon="/vitrine/outils/icon-min.png"
        imageAlt="Capture d'écran de la cartographie des lieux d'inclusion"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-cartographie.png"
        link="https://cartographie.societenumerique.gouv.fr"
        title="La cartographie des lieux d'inclusion numérique"
      />

      {/* Aidants Connect */}
      <ToolCard
        description="Vous accompagnez régulièrement et gratuitement des personnes en difficulté avec le numérique dans la réalisation de leurs démarches en ligne ? Aidants Connect est fait pour vous !"
        icon="/vitrine/outils/icon-aidants-connect.png"
        imageAlt="Capture d'écran d'Aidants Connect"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-aidants-connect.png"
        link="https://aidantsconnect.beta.gouv.fr/"
        title="Aidants Connect"
      />

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
