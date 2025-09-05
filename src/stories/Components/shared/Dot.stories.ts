import Dot from '../../../components/shared/Dot/Dot'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Dot> = {
  argTypes: {
    color: {
      control: 'select',
      options: [
        'dot-black',
        'dot-grey-sans-coporteur',
        'dot-purple-glycine-main-494',
        'dot-purple-glycine-850-200',
        'dot-purple-glycine-925-125',
        'dot-green-tilleul-verveine-850',
        'dot-green-tilleul-verveine-925',
        'dot-green-tilleul-verveine-950',
        'dot-blue-france-main-525',
        'dot-green-menthe-main-548',
        'dot-pink-macaron-main-689',
        'dot-pink-tuile-main-556',
      ],
    },
  },
  component: Dot,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Dot',
}

export default meta
type Story = StoryObj<typeof meta>

export const Noir: Story = {
  args: {
    color: 'dot-black',
  },
}

export const Gris: Story = {
  args: {
    color: 'dot-grey-sans-coporteur',
  },
}

export const PurpleGlycine: Story = {
  args: {
    color: 'dot-purple-glycine-main-494',
  },
}

export const GreenTilleul: Story = {
  args: {
    color: 'dot-green-tilleul-verveine-850',
  },
}

export const BlueFrance: Story = {
  args: {
    color: 'dot-blue-france-main-525',
  },
}

export const GreenMenthe: Story = {
  args: {
    color: 'dot-green-menthe-main-548',
  },
}

export const PinkMacaron: Story = {
  args: {
    color: 'dot-pink-macaron-main-689',
  },
}

export const PinkTuile: Story = {
  args: {
    color: 'dot-pink-tuile-main-556',
  },
}