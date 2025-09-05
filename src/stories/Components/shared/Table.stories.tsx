import Table from '../../../components/shared/Table/Table'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Table> = {
  argTypes: {
    isHeadHidden: {
      control: 'boolean',
    },
  },
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Table',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <tr>
          <td>
            Jean Dupont
          </td>
          <td>
            jean.dupont@email.fr
          </td>
          <td>
            Actif
          </td>
          <td>
            <button className="fr-btn fr-btn--sm" type="button">
              Modifier
            </button>
          </td>
        </tr>
        <tr>
          <td>
            Marie Martin
          </td>
          <td>
            marie.martin@email.fr
          </td>
          <td>
            Inactif
          </td>
          <td>
            <button className="fr-btn fr-btn--sm" type="button">
              Modifier
            </button>
          </td>
        </tr>
        <tr>
          <td>
            Pierre Durand
          </td>
          <td>
            pierre.durand@email.fr
          </td>
          <td>
            Actif
          </td>
          <td>
            <button className="fr-btn fr-btn--sm" type="button">
              Modifier
            </button>
          </td>
        </tr>
      </>
    ),
    enTetes: ['Nom', 'Email', 'Statut', 'Actions'],
    titre: 'Liste des utilisateurs',
  },
}

export const EntetesMasques: Story = {
  args: {
    children: (
      <>
        <tr>
          <td>
            Donnée 1
          </td>
          <td>
            Donnée 2
          </td>
          <td>
            Donnée 3
          </td>
        </tr>
        <tr>
          <td>
            Autre donnée 1
          </td>
          <td>
            Autre donnée 2
          </td>
          <td>
            Autre donnée 3
          </td>
        </tr>
      </>
    ),
    enTetes: ['Colonne 1', 'Colonne 2', 'Colonne 3'],
    isHeadHidden: true,
    titre: 'Données sans en-têtes visibles',
  },
}

export const TableauVide: Story = {
  args: {
    children: (
      <tr>
        <td
          colSpan={3}
          style={{ fontStyle: 'italic', textAlign: 'center' }}
        >
          Aucune donnée disponible
        </td>
      </tr>
    ),
    enTetes: ['Nom', 'Description', 'Date'],
    titre: 'Tableau sans données',
  },
}

export const AvecColonneVide: Story = {
  args: {
    children: (
      <>
        <tr>
          <td>
            <input type="checkbox" />
          </td>
          <td>
            Élément 1
          </td>
          <td>
            <span className="fr-badge fr-badge--success">
              Validé
            </span>
          </td>
          <td>
            <button className="fr-btn fr-btn--sm fr-btn--secondary" type="button">
              ⋮
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <input type="checkbox" />
          </td>
          <td>
            Élément 2
          </td>
          <td>
            <span className="fr-badge fr-badge--warning">
              En attente
            </span>
          </td>
          <td>
            <button className="fr-btn fr-btn--sm fr-btn--secondary" type="button">
              ⋮
            </button>
          </td>
        </tr>
      </>
    ),
    enTetes: ['', 'Nom', 'Statut', ''],
    titre: 'Tableau avec colonne vide',
  },
}