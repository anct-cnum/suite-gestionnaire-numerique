import ReadMore from '../../../components/shared/ReadMore/ReadMore'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof ReadMore> = {
  component: ReadMore,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/ReadMore',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    texte: `
      <p>Ceci est le début du texte qui sera visible par défaut.</p>
      <p>Voici la suite du contenu qui ne sera visible qu'après avoir cliqué sur "Lire plus".</p>
      <p>Ce composant permet de masquer une partie du contenu pour améliorer la lisibilité de la page.</p>
      <p>Le texte peut contenir du HTML et sera affiché correctement.</p>
    `,
  },
}

export const TexteCourt: Story = {
  args: {
    texte: '<p>Un texte court qui peut quand même être étendu.</p><p>Voici le contenu supplémentaire.</p>',
  },
}

export const AvecListe: Story = {
  args: {
    texte: `
      <p>Description principale du service.</p>
      <ul>
        <li>Fonctionnalité 1 : Description détaillée</li>
        <li>Fonctionnalité 2 : Autre description</li>
        <li>Fonctionnalité 3 : Encore plus de détails</li>
      </ul>
      <p>Informations complémentaires sur l'utilisation.</p>
    `,
  },
}

export const AvecFormatage: Story = {
  args: {
    texte: `
      <p>Texte avec <strong>mise en forme</strong> et <em>styles</em>.</p>
      <p>Vous pouvez également inclure des <a href="#">liens</a> dans le contenu.</p>
      <blockquote>Citation importante à retenir.</blockquote>
    `,
  },
}