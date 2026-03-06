import { Meta, StoryObj } from '@storybook/nextjs-vite'

import MenuCollant from '@/components/AidantDetails/MenuCollant'

const meta: Meta<typeof MenuCollant> = {
  component: MenuCollant,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodoc'],
  title: 'Shared/MenuCollant',
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    contentId: 'storybook-content',
    items: [
      { linkProps: { href: '#header' }, text: 'En-tête' },
      { linkProps: { href: '#informations-personnelles' }, text: 'Informations personnelles' },
      { linkProps: { href: '#structures-employeuses' }, text: 'Structures employeuses' },
      { linkProps: { href: '#activites' }, text: 'Activités' },
      { linkProps: { href: '#lieux-activite' }, text: 'Lieux d\'activité' },
    ],
  },
}

export const WithFewSections: Story = {
  args: {
    contentId: 'storybook-content',
    items: [
      { linkProps: { href: '#section1' }, text: 'Section 1' },
      { linkProps: { href: '#section2' }, text: 'Section 2' },
    ],
  },
}

export const WithManySections: Story = {
  args: {
    contentId: 'storybook-content',
    items: [
      { linkProps: { href: '#section1' }, text: 'Section 1' },
      { linkProps: { href: '#section2' }, text: 'Section 2' },
      { linkProps: { href: '#section3' }, text: 'Section 3' },
      { linkProps: { href: '#section4' }, text: 'Section 4' },
      { linkProps: { href: '#section5' }, text: 'Section 5' },
      { linkProps: { href: '#section6' }, text: 'Section 6' },
      { linkProps: { href: '#section7' }, text: 'Section 7' },
    ],
  },
}
