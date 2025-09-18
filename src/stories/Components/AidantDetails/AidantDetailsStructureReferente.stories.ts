import AidantDetailsStructureReferente from '@/components/AidantDetails/AidantDetailsStructureReferente'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AidantDetailsStructureReferente> = {
  argTypes: {
    referent: {
      description: 'Données du référent de la structure',
    },
  },
  component: AidantDetailsStructureReferente,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/AidantDetails/structureReferente',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    referent: {
      email: 'marie.dubois@ville-paris.fr',
      nom: 'Dubois',
      post: 'Responsable des services numériques',
      prenom: 'Marie',
      telephone: '01 42 76 40 40',
    },
  },
}

export const ReferentDirecteur: Story = {
  args: {
    referent: {
      email: 'jean.martin@prefecture.gouv.fr',
      nom: 'Martin',
      post: 'Directeur adjoint',
      prenom: 'Jean',
      telephone: '01 53 72 80 00',
    },
  },
}

export const ReferentCoordinateur: Story = {
  args: {
    referent: {
      email: 'sophie.bernard@mairie-lyon.fr',
      nom: 'Bernard',
      post: 'Coordinatrice inclusion numérique',
      prenom: 'Sophie',
      telephone: '04 72 10 30 30',
    },
  },
}

export const ReferentLongPost: Story = {
  args: {
    referent: {
      email: 'pierre.durand@communaute-communes.fr',
      nom: 'Durand',
      post: 'Responsable du développement territorial et de l\'inclusion numérique',
      prenom: 'Pierre',
      telephone: '05 61 23 45 67',
    },
  },
}

export const ReferentSansPrenom: Story = {
  args: {
    referent: {
      email: 'contact@association-aide.org',
      nom: 'Leblanc',
      post: 'Directrice',
      prenom: '',
      telephone: '02 96 15 78 90',
    },
  },
}

export const ReferentSansNom: Story = {
  args: {
    referent: {
      email: 'claire@mediateque-centrale.fr',
      nom: '',
      post: 'Médiatrice numérique',
      prenom: 'Claire',
      telephone: '03 88 14 56 78',
    },
  },
}

export const ReferentSansPost: Story = {
  args: {
    referent: {
      email: 'julien.moreau@ccas.fr',
      nom: 'Moreau',
      post: '',
      prenom: 'Julien',
      telephone: '04 91 52 36 14',
    },
  },
}

export const ReferentEmailSeulement: Story = {
  args: {
    referent: {
      email: 'contact@structure-inclusion.org',
      nom: '',
      post: '',
      prenom: '',
      telephone: '',
    },
  },
}

export const ReferentTelephoneSeulement: Story = {
  args: {
    referent: {
      email: '',
      nom: '',
      post: '',
      prenom: '',
      telephone: '01 42 12 34 56',
    },
  },
}

export const ReferentTelephoneMobile: Story = {
  args: {
    referent: {
      email: 'anne.petit@espace-numerique.fr',
      nom: 'Petit',
      post: 'Animatrice numérique',
      prenom: 'Anne',
      telephone: '06 12 34 56 78',
    },
  },
}

export const SansReferent: Story = {
  args: {
    referent: {
      email: '',
      nom: '',
      post: '',
      prenom: '',
      telephone: '',
    },
  },
}

export const ReferentUndefined: Story = {
  args: {
    referent: undefined,
  },
}
