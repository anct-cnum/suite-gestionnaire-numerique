import Tag from '../../../components/shared/Tag/Tag'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Tag> = {
  argTypes: {
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
    },
  },
  component: Tag,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Tag',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Tag exemple',
    href: '/exemple',
  },
}

export const NouvellePagene: Story = {
  args: {
    children: 'Lien externe',
    href: 'https://example.com',
    target: '_blank',
  },
}

export const TagLong: Story = {
  args: {
    children: 'Catégorie avec nom long',
    href: '/categorie/sous-categorie',
  },
}

export const TagCourt: Story = {
  args: {
    children: 'Tag',
    href: '/tag',
  },
}