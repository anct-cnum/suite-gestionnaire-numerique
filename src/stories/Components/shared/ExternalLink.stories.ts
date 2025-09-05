import ExternalLink from '../../../components/shared/ExternalLink/ExternalLink'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ExternalLink> = {
  component: ExternalLink,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/ExternalLink',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Visiter example.com',
    href: 'https://example.com',
    title: 'Lien vers example.com',
  },
}

export const AvecClasse: Story = {
  args: {
    children: 'Google',
    className: 'fr-link fr-icon-external-link-line fr-link--icon-right',
    href: 'https://google.com',
    title: 'Rechercher sur Google',
  },
}

export const LongTexte: Story = {
  args: {
    children: 'Accéder au site officiel du gouvernement français pour plus d\'informations',
    href: 'https://www.gouvernement.fr',
    title: 'Site officiel du gouvernement français',
  },
}