import { describe, expect, it } from 'vitest'

import { FabriqueDeDefi, ProposerUnDefi, ReponsesDeLHeureLoader } from './ProposerUnDefi'
import { DefiAProposer } from '@/domain/mesure-impact/AntiAbus'

describe('proposer un défi anti-abus au questionnaire public', () => {
  it.each([
    { difficulte: 'normale', reponsesDeLHeure: 3 },
    { difficulte: 'renforcee', reponsesDeLHeure: 250 },
  ])(
    'avec $reponsesDeLHeure réponses depuis le début de l’heure, le défi est de difficulté $difficulte',
    async ({ difficulte, reponsesDeLHeure }) => {
      // GIVEN
      const comptes: Array<Readonly<{ depuis: string; identifiantPublic: string }>> = []
      const loader: ReponsesDeLHeureLoader = {
        async nombreDepuis(identifiantPublic: string, depuis: Date): Promise<number> {
          comptes.push({ depuis: depuis.toJSON(), identifiantPublic })
          return Promise.resolve(reponsesDeLHeure)
        },
      }
      const defisCrees: Array<DefiAProposer & Readonly<{ identifiantPublic: string }>> = []
      const fabrique: FabriqueDeDefi = {
        async creer(defi): Promise<string> {
          defisCrees.push(defi)
          return Promise.resolve('defi-signe')
        },
      }

      // WHEN
      const defi = await new ProposerUnDefi(loader, fabrique, new Date('2026-11-16T14:32:17.123Z')).handle({
        identifiantPublic: 'sicoval',
      })

      // THEN
      expect(defi).toBe('defi-signe')
      expect(comptes).toStrictEqual([{ depuis: '2026-11-16T14:00:00.000Z', identifiantPublic: 'sicoval' }])
      expect(defisCrees).toStrictEqual([
        { difficulte, expiration: new Date('2026-11-16T15:32:17.123Z'), identifiantPublic: 'sicoval' },
      ])
    }
  )
})
