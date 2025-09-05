import TextArea from '../../../components/shared/TextArea/TextArea'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof TextArea> = {
  argTypes: {
    disable: {
      control: 'boolean',
    },
    maxLength: {
      control: { min: 1, type: 'number' },
    },
    rows: {
      control: { max: 30, min: 1, type: 'number' },
    },
  },
  component: TextArea,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/TextArea',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Zone de texte',
  },
}

export const AvecValeurDefaut: Story = {
  args: {
    children: 'Commentaire',
    defaultValue: 'Voici un commentaire pré-rempli dans la zone de texte.',
  },
}

export const Desactive: Story = {
  args: {
    children: 'Zone désactivée',
    defaultValue: 'Cette zone de texte est désactivée',
    disable: true,
  },
}

export const Petite: Story = {
  args: {
    children: 'Zone compacte',
    rows: 5,
  },
}

export const Grande: Story = {
  args: {
    children: 'Zone étendue',
    rows: 25,
  },
}

export const AvecLimiteLongueur: Story = {
  args: {
    children: 'Message limité (100 caractères)',
    defaultValue: 'Ce texte est limité à 100 caractères maximum.',
    maxLength: 100,
  },
}

export const MessageCourt: Story = {
  args: {
    children: 'Note rapide',
    maxLength: 50,
    rows: 3,
  },
}