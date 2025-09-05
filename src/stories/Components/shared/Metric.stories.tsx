import Metric from '@/components/shared/Metric/Metric'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Metric> = {
  argTypes: {
    chiffre: {
      description: 'Le chiffre à afficher',
    },
    prefix: {
      description: 'Préfixe avant le chiffre',
    },
    sousTitre: {
      description: 'Sous-titre descriptif',
    },
    suffix: {
      description: 'Suffixe après le chiffre',
    },
    titre: {
      description: 'Titre principal',
    },
  },
  component: Metric,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Metric',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    chiffre: '1,250',
    sousTitre: 'Depuis le début du programme',
    titre: 'Personnes accompagnées',
  },
}

export const WithPrefix: Story = {
  args: {
    chiffre: '250,000',
    prefix: '+ ',
    sousTitre: 'Budget total alloué',
    titre: 'Euros',
  },
}

export const WithSuffix: Story = {
  args: {
    chiffre: '87',
    sousTitre: 'Taux de satisfaction',
    suffix: '%',
    titre: 'Satisfaction',
  },
}

export const WithPrefixAndSuffix: Story = {
  args: {
    chiffre: '42.5',
    prefix: '≈ ',
    sousTitre: 'Temps moyen par session',
    suffix: ' min',
    titre: 'Durée moyenne',
  },
}

export const MultipleMetrics: Story = {
  render: () => (
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-md-3 fr-col-6">
        <Metric
          chiffre="1,250"
          sousTitre="Depuis le début du programme"
          titre="Personnes accompagnées"
        />
      </div>
      <div className="fr-col-md-3 fr-col-6">
        <Metric
          chiffre="87"
          sousTitre="Conseillers actifs"
          suffix=" %"
          titre="Taux d'activité"
        />
      </div>
      <div className="fr-col-md-3 fr-col-6">
        <Metric
          chiffre="250,000"
          prefix="+ "
          sousTitre="Budget total alloué"
          titre="Euros"
        />
      </div>
      <div className="fr-col-md-3 fr-col-6">
        <Metric
          chiffre="42.5"
          prefix="≈ "
          sousTitre="Temps moyen par session"
          suffix=" min"
          titre="Durée moyenne"
        />
      </div>
    </div>
  ),
}