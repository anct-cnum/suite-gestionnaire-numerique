import Stepper from '../../../components/shared/Stepper/Stepper'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Stepper> = {
  argTypes: {
    currentStep: {
      control: { min: 1, type: 'number' },
    },
  },
  component: Stepper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Stepper',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultSteps = [
  { title: 'Informations personnelles' },
  { title: 'Adresse et contact' },
  { title: 'Validation et signature' },
  { title: 'Confirmation' },
]

export const PremiereEtape: Story = {
  args: {
    currentStep: 1,
    steps: defaultSteps,
  },
}

export const DeuxiemeEtape: Story = {
  args: {
    currentStep: 2,
    steps: defaultSteps,
  },
}

export const TroisiemeEtape: Story = {
  args: {
    currentStep: 3,
    steps: defaultSteps,
  },
}

export const DerniereEtape: Story = {
  args: {
    currentStep: 4,
    steps: defaultSteps,
  },
}

export const ProcessusCourt: Story = {
  args: {
    currentStep: 1,
    steps: [
      { title: 'Création' },
      { title: 'Validation' },
    ],
  },
}

export const ProcessusLong: Story = {
  args: {
    currentStep: 3,
    steps: [
      { title: 'Connexion' },
      { title: 'Profil' },
      { title: 'Préférences' },
      { title: 'Sécurité' },
      { title: 'Notifications' },
      { title: 'Finalisation' },
    ],
  },
}