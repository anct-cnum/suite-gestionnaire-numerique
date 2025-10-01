import { createDefaultPersonnesTravaillantData } from './LieuInclusionDetailsTestData'
import LieuInclusionDetailsPersonnes from '@/components/LieuInclusionDetails/LieuInclusionDetailsPersonnes'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof LieuInclusionDetailsPersonnes> = {
  argTypes: {
    data: {
      description: 'Liste des personnes travaillant dans le lieu d\'inclusion numérique',
    },
  },
  component: LieuInclusionDetailsPersonnes,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/LieuInclusionDetails/Personnes',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: createDefaultPersonnesTravaillantData(),
  },
}

export const AucunePersonne: Story = {
  args: {
    data: [],
  },
}

export const PersonneUnique: Story = {
  args: {
    data: [
      {
        email: 'sophie.bernard@exemple.fr',
        id: 1,
        nom: 'Bernard',
        prenom: 'Sophie',
        role: 'Conseiller numérique',
        telephone: '01 23 45 67 89',
      },
    ],
  },
}

export const PersonneSansContact: Story = {
  args: {
    data: [
      {
        id: 2,
        nom: 'Moreau',
        prenom: 'Julien',
        role: 'Médiateur numérique',
      },
    ],
  },
}

export const PersonneAvecEmailSeulement: Story = {
  args: {
    data: [
      {
        email: 'claire.martin@exemple.fr',
        id: 3,
        nom: 'Martin',
        prenom: 'Claire',
        role: 'Coordinatrice',
      },
    ],
  },
}

export const PersonneAvecTelephoneSeulement: Story = {
  args: {
    data: [
      {
        id: 4,
        nom: 'Petit',
        prenom: 'Lucas',
        role: 'Agent d\'accueil',
        telephone: '01 98 76 54 32',
      },
    ],
  },
}

export const PersonneSansRole: Story = {
  args: {
    data: [
      {
        email: 'thomas.dubois@exemple.fr',
        id: 5,
        nom: 'Dubois',
        prenom: 'Thomas',
        telephone: '01 11 22 33 44',
      },
    ],
  },
}

export const PlusieursPersonnes: Story = {
  args: {
    data: [
      {
        email: 'jean.martin@franceservices.gouv.fr',
        id: 6,
        nom: 'Martin',
        prenom: 'Jean',
        role: 'Conseiller numérique',
        telephone: '01 23 45 67 89',
      },
      {
        email: 'marie.durand@franceservices.gouv.fr',
        id: 7,
        nom: 'Durand',
        prenom: 'Marie',
        role: 'Médiateur numérique',
        telephone: '01 23 45 67 90',
      },
      {
        id: 8,
        nom: 'Leroy',
        prenom: 'Pierre',
        role: 'Agent d\'accueil',
      },
      {
        email: 'sophie.bernard@exemple.fr',
        id: 9,
        nom: 'Bernard',
        prenom: 'Sophie',
        role: 'Coordinatrice territoriale',
        telephone: '01 55 66 77 88',
      },
      {
        email: 'paul.moreau@exemple.fr',
        id: 10,
        nom: 'Moreau',
        prenom: 'Paul',
        role: 'Formateur numérique',
      },
      {
        id: 11,
        nom: 'Petit',
        prenom: 'Emma',
        role: 'Assistante administrative',
        telephone: '01 44 55 66 77',
      },
    ],
  },
}

export const NomsTresLongs: Story = {
  args: {
    data: [
      {
        email: 'jean-christophe.martin-durand@franceservices.gouv.fr',
        id: 12,
        nom: 'Martin-Durand de la Fontaine',
        prenom: 'Jean-Christophe',
        role: 'Conseiller numérique spécialisé en accompagnement des seniors',
        telephone: '01 23 45 67 89',
      },
      {
        email: 'marie-claire.dubois-bernard@exemple.fr',
        id: 13,
        nom: 'Dubois-Bernard',
        prenom: 'Marie-Claire',
        role: 'Coordinatrice territoriale et responsable de la médiation numérique',
        telephone: '01 23 45 67 90',
      },
    ],
  },
}
