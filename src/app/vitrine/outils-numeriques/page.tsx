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
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        icon="/vitrine/outils/icon-min.svg"
        imageAlt="Capture d'écran de Mon inclusion Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-min.png"
        link="/vitrine/outils-numeriques/min"
        title="Mon inclusion Numérique"
      />

      {/* La Coop de la Médiation */}
      <ToolCard
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        icon="/vitrine/outils/icon-coop.svg"
        imageAlt="Capture d'écran de La Coop de la Médiation"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-coop.png"
        link="https://lacoopdelamediation.numerique.gouv.fr/"
        title="La Coop de la Médiation"
      />

      {/* Tableau de pilotage Conseiller Numérique */}
      <ToolCard
        badge="DISPONIBLE"
        description="Ipsum mattis commodo purus varius. Tristique lacus urna interdum diam pretium enim. Dignissim nulla condimentum tellus et enim vestibulum. Molestie."
        imageAlt="Capture d'écran du Tableau de pilotage Conseiller Numérique"
        imageBackground="#FFFFFF"
        imageSrc="/vitrine/outils/visuel-cnfs.png"
        link="https://pilotage.conseiller-numerique.gouv.fr/"
        title="Tableau de pilotage Conseiller Numérique"
      />

      {/* Section Qui sommes-nous */}
      <QuiSommesNous />
    </>
  )
}
