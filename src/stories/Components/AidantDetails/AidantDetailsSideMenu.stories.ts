import { Meta, StoryObj } from '@storybook/nextjs-vite'

import AidantDetailsSideMenu from '@/components/AidantDetails/AidantDetailsSideMenu'

const meta: Meta<typeof AidantDetailsSideMenu> = {
  component: AidantDetailsSideMenu,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodoc'],
  title: 'Components/AidantDetails/AidantDetailsSideMenu',
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    sections: [
      { id: 'header', label: 'En-tête' },
      { id: 'informations-personnelles', label: 'Informations personnelles' },
      { id: 'structures-employeuses', label: 'Structures employeuses' },
      { id: 'activites', label: 'Activités' },
      { id: 'lieux-activite', label: 'Lieux d\'activité' },
    ],
  },
}

export const WithFewSections: Story = {
  args: {
    sections: [
      { id: 'section1', label: 'Section 1' },
      { id: 'section2', label: 'Section 2' },
    ],
  },
}

export const WithManySections: Story = {
  args: {
    sections: [
      { id: 'section1', label: 'Section 1' },
      { id: 'section2', label: 'Section 2' },
      { id: 'section3', label: 'Section 3' },
      { id: 'section4', label: 'Section 4' },
      { id: 'section5', label: 'Section 5' },
      { id: 'section6', label: 'Section 6' },
      { id: 'section7', label: 'Section 7' },
    ],
  },
}
