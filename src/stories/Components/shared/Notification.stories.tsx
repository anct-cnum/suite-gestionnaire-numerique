import React, { ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { Notification } from '../../../components/shared/Notification/Notification'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Notification> = {
  component: () => null,
  decorators: [
    (Story: React.ComponentType): ReactElement => (
      <>
        <Story />
        <ToastContainer 
          autoClose={5000}
          closeOnClick
          draggable
          hideProgressBar={false}
          newestOnTop={false}
          pauseOnFocusLoss
          pauseOnHover
          position="top-right"
          rtl={false}
          theme="light"
        />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: 'Composant de notification toast. Cliquez sur les boutons ci-dessous pour voir les notifications.',
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Notification',
}

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  render(): ReactElement {
    function handleClick(): void {
      Notification('success', {
        description: 'L&apos;opération s&apos;est déroulée avec succès.',
        title: 'Succès !',
      })
    }
    
    return (
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          className="fr-btn"
          onClick={handleClick}
          type="button"
          type="button"
        >
          Afficher notification de succès
        </button>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
          Cliquez sur le bouton pour voir la notification apparaître en haut à droite
        </p>
      </div>
    )
  },
}

export const ErrorState: Story = {
  render(): ReactElement {
    function handleClick(): void {
      Notification('error', {
        description: 'Une erreur est survenue lors de l&apos;opération.',
        title: 'Erreur !',
      })
    }
    
    return (
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button
          className="fr-btn fr-btn--secondary"
          onClick={handleClick}
        >
          Afficher notification d'erreur
        </button>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
          Cliquez sur le bouton pour voir la notification d'erreur apparaître en haut à droite
        </p>
      </div>
    )
  },
}

export const Comparaison: Story = {
  render(): ReactElement {
    function handleSuccessClick(): void {
      Notification('success', {
        description: 'Les données ont été sauvegardées avec succès.',
        title: 'Opération réussie',
      })
    }
    
    function handleErrorClick(): void {
      Notification('error', {
        description: 'Veuillez vérifier les champs obligatoires.',
        title: 'Erreur de validation',
      })
    }
    
    return (
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="fr-btn"
            onClick={handleSuccessClick}
            type="button"
          >
            Succès
          </button>
          <button
            className="fr-btn fr-btn--secondary"
            onClick={handleErrorClick}
            type="button"
          >
            Erreur
          </button>
        </div>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
          Testez les deux types de notifications
        </p>
      </div>
    )
  },
}