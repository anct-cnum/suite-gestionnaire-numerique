import { Metadata } from 'next'
import { ReactElement } from 'react'

import HeroSection from '@/components/vitrine/HeroSection/HeroSection'
import QuiSommesNous from '@/components/vitrine/QuiSommesNous/QuiSommesNous'
import ToolCard from '@/components/vitrine/ToolCard/ToolCard'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default function OutilsNumeriquesPage(): ReactElement {
  return (
    <>
      <HeroSection
        backgroundImage="/vitrine/outils/hero.png"
        subtitle="Nunc enim pellentesque consectetur tempor Vel lobortis accumsan luctus viverra donec nisl ac."
        title="Les outils professionnels de l'inclusion numérique"
      />

      {/* Mon inclusion Numérique */}
      <ToolCard
        description="Mon Inclusion Numérique est une suite d'outils conçus par et pour les gestionnaires de la politique d'inclusion numérique qui propose une mise en cohérence des différentes données."
        icon="/vitrine/outils/icon-min.png"
        imageAlt="Capture d'écran de Mon inclusion Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-min.png"
        link="/vitrine/outils-numeriques/min"
        title="Mon inclusion Numérique"
      />

      {/* La Coop de la Médiation */}
      <ToolCard
        description="La Coop facilite le suivi de vos accompagnements et de vos bénéficiaires et vous permet de valoriser votre activité auprès de vos financeurs (statistiques, le compte-rendu SAS en main."
        icon="/vitrine/outils/icon-coop.png"
        imageAlt="Capture d'écran de La Coop de la Médiation"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-coop.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="La Coop de la Médiation"
      />

      {/* Les bases du numérique d'intérêt général */}
      <ToolCard
        description="Les Bases est une plateforme collaborative nationale de partage de ressources, de supports pédagogiques et de communs numériques, accessible et ouvert aux structures de tous"
        imageAlt="Capture d'écran des bases du numérique d'intérêt général"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-bases.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="Les bases du numérique d'intérêt général"
      />

      {/* La cartographie des lieux d'inclusion */}
      <ToolCard
        description="Que vous soyez un particulier ou un professionnel, la cartographie nationale est là pour vous aider à trouver les lieux d'accompagnement au numérique les plus proches et adaptés à vos besoins ou à ceux de vos bénéficiaires !"
        imageAlt="Capture d'écran de la cartographie des lieux d'inclusion"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-cartographie.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="La cartographie des lieux d'inclusion"
      />

      {/* La Suite des aidants */}
      <ToolCard
        badge="à venir"
        badgeColor="info"
        badgeIcon={false}
        description="Aidants Connect est le service public numérique qui protège les aidants professionnels et les personnes accompagnées dans la réalisation de démarches administratives en ligne."
        imageAlt="Capture d'écran de La Suite des aidants"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-cnfs.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="La Suite des aidants"
      />

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
