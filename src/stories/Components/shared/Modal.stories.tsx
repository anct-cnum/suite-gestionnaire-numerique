import Modal from '@/components/shared/Modal/Modal'
import ModalTitle from '@/components/shared/ModalTitle/ModalTitle'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Modal> = {
  argTypes: {
    children: {
      description: 'Contenu de la modale',
    },
    id: {
      description: 'Identifiant unique de la modale',
    },
    isOpen: {
      description: 'État ouvert/fermé',
    },
    labelId: {
      description: 'ID du label (titre)',
    },
  },
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Modal',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="fr-modal__content">
        <ModalTitle id="modal-title">
          Titre de la modale
        </ModalTitle>
        <p>
          Contenu de la modale avec du texte explicatif.
        </p>
        <div className="fr-modal__footer">
          <button
            className="fr-btn fr-btn--primary"
            type="button"
          >
            Confirmer
          </button>
          <button
            className="fr-btn fr-btn--secondary"
            type="button"
          >
            Annuler
          </button>
        </div>
      </div>
    ),
    close: () => { /* Mock callback */ },
    id: 'modal-example',
    isOpen: true,
    labelId: 'modal-title',
  },
}

export const WithForm: Story = {
  args: {
    children: (
      <div className="fr-modal__content">
        <ModalTitle id="modal-form-title">
          Formulaire dans une modale
        </ModalTitle>
        <form>
          <div className="fr-input-group">
            <label
              className="fr-label"
              htmlFor="nom"
            >
              Nom
            </label>
            <input
              className="fr-input"
              id="nom"
              name="nom"
              type="text"
            />
          </div>
          <div className="fr-input-group">
            <label
              className="fr-label"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="fr-input"
              id="email"
              name="email"
              type="email"
            />
          </div>
        </form>
        <div className="fr-modal__footer">
          <button
            className="fr-btn fr-btn--primary"
            type="submit"
          >
            Envoyer
          </button>
          <button
            className="fr-btn fr-btn--secondary"
            type="button"
          >
            Annuler
          </button>
        </div>
      </div>
    ),
    close: () => { /* Mock callback */ },
    id: 'modal-form',
    isOpen: true,
    labelId: 'modal-form-title',
  },
}

export const Closed: Story = {
  args: {
    children: (
      <div className="fr-modal__content">
        <ModalTitle id="modal-closed-title">
          Modale fermée
        </ModalTitle>
        <p>
          Cette modale est fermée par défaut.
        </p>
      </div>
    ),
    close: () => { /* Mock callback */ },
    id: 'modal-closed',
    isOpen: false,
    labelId: 'modal-closed-title',
  },
}