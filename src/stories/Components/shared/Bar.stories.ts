import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'

import Bar from '../../../components/shared/Bar/Bar'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const meta: Meta<typeof Bar> = {
  component: Bar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Bar',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    backgroundColor: ['#6A6AF4', '#9A9AF7', '#BCBCFA', '#DDDDFB', '#EEEEFC', '#F7F7FE'],
    data: [45, 38, 29, 22, 16, 8],
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
  },
}

export const DonneesImportantes: Story = {
  args: {
    backgroundColor: ['#FF6B6B', '#FF8E8E', '#FFB1B1', '#FFD4D4'],
    data: [150, 120, 98, 75],
    labels: ['T1', 'T2', 'T3', 'T4'],
  },
}

export const AvecUneSeuleValeur: Story = {
  args: {
    backgroundColor: ['#6A6AF4'],
    data: [42],
    labels: ['Valeur unique'],
  },
}