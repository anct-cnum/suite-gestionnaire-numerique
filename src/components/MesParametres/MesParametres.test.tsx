import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MesParametres from './MesParametres'

describe('mes paramètres : en tant qu’utilisateur authentifié', () => {
  describe('quand je me rends sur la page de visualisation et personnalisation de mes paramètres de compte', () => {
    const titre = 'Mes paramètres de compte'
    const sousTitre = 'Retrouvez ici, vos préférences de communication et d’affichage.'

    it(`alors elle se présente avec pour titre "${titre}"`, () => {
      // WHEN
      render(<MesParametres />)

      // THEN
      expect(screen.getByRole('heading', { level: 1, name: titre })).toBeInTheDocument()
    })

    it(`et sous-titre "${sousTitre}"`, () => {
      // WHEN
      render(<MesParametres />)

      // THEN
      expect(screen.getByText(sousTitre)).toBeInTheDocument()
    })

    describe('les paramètres proposés sont', () => {
      const titrePreferencesDeCommunicationEtNotification = 'Communication et notifications'
      const titrePreferencesDAffichage = 'Affichage'

      describe('mes préférences de notification', () => {
        it(`avec pour titre "${titrePreferencesDeCommunicationEtNotification}"`, () => {
          // WHEN
          render(<MesParametres />)

          // THEN
          expect(regionPreferencesDeCommunicationEtNotification()).toBeInTheDocument()
        })

        describe('permettant d’activer ou désactiver la réception par voie électronique', () => {
          it('de toutes les notifications', () => {
            // WHEN
            render(<MesParametres />)

            // THEN
            const receptionNotifsToggle = within(regionPreferencesDeCommunicationEtNotification())
              .getByRole(
                'checkbox',
                { checked: false, name: 'Recevoir toutes les notifications sur votre adresse électronique' }
              )
            expect(receptionNotifsToggle).toBeInTheDocument()
          })

          it('d’un récapitulatif hebdomadaire', () => {
            // WHEN
            render(<MesParametres />)

            // THEN
            const receptionRecapHebdoToggle = within(regionPreferencesDeCommunicationEtNotification())
              .getByRole(
                'checkbox',
                { checked: false, name: 'Recevoir un récapitulatif hebdomadaire sur votre adresse électronique' }
              )
            expect(receptionRecapHebdoToggle).toBeInTheDocument()
          })
        })

        function regionPreferencesDeCommunicationEtNotification(): HTMLElement {
          return screen.getByRole(
            'region',
            { name: titrePreferencesDeCommunicationEtNotification }
          )
        }
      })

      describe('mes préférences d’affichage', () => {
        it(`avec pour titre "${titrePreferencesDAffichage}"`, () => {
          // WHEN
          render(<MesParametres />)

          // THEN
          expect(regionPreferencesDAffichage()).toBeInTheDocument()
        })

        it('permettant de basculer le thème de l’application entre clair et sombre', () => {
          // WHEN
          render(<MesParametres />)

          // THEN
          const modeClairRadio = within(regionPreferencesDAffichage()).getByRole('radio', { name: 'Mode clair' })
          const modeSombreRadio = within(regionPreferencesDAffichage()).getByRole('radio', { name: 'Mode sombre' })
          expect(modeClairRadio).toBeInTheDocument()
          expect(modeSombreRadio).toBeInTheDocument()
        })

        function regionPreferencesDAffichage(): HTMLElement {
          return screen
            .getByRole(
              'region',
              { name: titrePreferencesDAffichage }
            )
        }
      })
    })
  })
})
