import Icon from '../../../components/shared/Icon/Icon'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Icon> = {
  argTypes: {
    icon: {
      control: 'select',
      options: [
        'home-4-line',
        'user-line',
        'settings-5-line',
        'mail-line',
        'phone-line',
        'calendar-line',
        'file-text-line',
        'download-line',
        'upload-line',
        'search-line',
        'close-line',
        'arrow-right-line',
        'arrow-left-line',
        'arrow-up-line',
        'arrow-down-line',
        'check-line',
        'error-warning-line',
        'information-line',
        'add-line',
        'subtract-line',
        'external-link-line',
      ],
    },
  },
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Icon',
}

export default meta
type Story = StoryObj<typeof meta>

export const Home: Story = {
  args: {
    icon: 'home-4-line',
  },
}

export const User: Story = {
  args: {
    icon: 'user-line',
  },
}

export const Settings: Story = {
  args: {
    icon: 'settings-5-line',
  },
}

export const Mail: Story = {
  args: {
    icon: 'mail-line',
  },
}

export const Check: Story = {
  args: {
    icon: 'check-line',
  },
}

export const Warning: Story = {
  args: {
    icon: 'error-warning-line',
  },
}

export const Information: Story = {
  args: {
    icon: 'information-line',
  },
}

export const AvecClasse: Story = {
  args: {
    classname: 'fr-text--lg',
    icon: 'home-4-line',
  },
}

export const ExternalLink: Story = {
  args: {
    icon: 'external-link-line',
  },
}