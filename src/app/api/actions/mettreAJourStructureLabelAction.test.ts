import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { mettreAJourStructureLabelAction } from './mettreAJourStructureLabelAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { MettreAJourStructureDepuisEntreprise } from '@/use-cases/commands/MettreAJourStructureDepuisEntreprise'
import { RechercherUneEntreprise } from '@/use-cases/queries/RechercherUneEntreprise'
import { utilisateurReadModelFactory } from '@/use-cases/testHelper'

describe('mettre à jour la structure depuis le parcours label action', () => {
  it('met à jour la structure avec les données officielles et purge le cache', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle').mockResolvedValueOnce({
      activitePrincipale: '88.99B - Action sociale sans hébergement n.c.a.',
      adresse: '172 B RTE DE LYON, 42300 ROANNE',
      categorieJuridiqueCode: '9220',
      codeInsee: '42187',
      codePostal: '42300',
      commune: 'ROANNE',
      denomination: 'Emmaus Connect',
      identifiant: '79227291600034',
      nomVoie: 'RTE DE LYON',
      numeroVoie: '172',
    })
    vi.spyOn(MettreAJourStructureDepuisEntreprise.prototype, 'handle').mockResolvedValueOnce('OK')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(() => undefined)

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(MettreAJourStructureDepuisEntreprise.prototype.handle).toHaveBeenCalledWith({
      adresse: '172 B RTE DE LYON, 42300 ROANNE',
      categorieJuridique: '9220',
      codeActivitePrincipale: '88.99B',
      denominationSirene: 'Emmaus Connect',
      siret: '79227291600034',
      structureId: 978,
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/label')
    expect(messages).toStrictEqual(['OK'])
  })

  it('renvoie une erreur de validation quand le siret est invalide', async () => {
    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '123',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Format invalide : saisissez 6-7 chiffres (RIDET) ou 14 chiffres (SIRET)'])
  })

  it('refuse l’action à un utilisateur qui n’est pas gestionnaire de structure', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({ isBetaTesteur: true })
    )

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux gestionnaires autorisés'])
  })

  it('refuse l’action à un gestionnaire de structure non bêta-testeur', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
    vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
      utilisateurReadModelFactory({
        isBetaTesteur: false,
        role: {
          categorie: 'structure',
          doesItBelongToGroupeAdmin: false,
          nom: 'Gestionnaire structure',
          organisation: 'Solidarnum',
          rolesGerables: ['gestionnaire_structure'],
          type: 'gestionnaire_structure',
        },
        structureId: 978,
      })
    )
    vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([])

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Action réservée aux gestionnaires autorisés'])
  })

  it('refuse la modification d’une structure qui n’est pas celle du gestionnaire', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 999,
    })

    // THEN
    expect(messages).toStrictEqual(['Vous ne pouvez modifier que votre structure'])
  })

  it('refuse la modification quand la structure n’est pas éligible au label', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(false)

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Votre structure n’est pas éligible au label conseiller numérique'])
  })

  it('renvoie une erreur quand le siret n’est pas retrouvé via l’API Entreprise', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle').mockResolvedValueOnce({ estTrouvee: false })

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Le SIRET renseigné n’a pas pu être retrouvé. Vérifiez le numéro saisi.'])
  })

  it('renvoie une erreur quand l’API Entreprise est indisponible', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle').mockRejectedValueOnce(new Error('timeout'))

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Service temporairement indisponible. Veuillez réessayer.'])
  })

  it('traduit l’échec « adresse introuvable » renvoyé par la commande', async () => {
    // GIVEN
    stubGestionnaireBetaTesteur()
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)
    vi.spyOn(RechercherUneEntreprise.prototype, 'handle').mockResolvedValueOnce({
      activitePrincipale: '88.99B',
      adresse: '172 B RTE DE LYON, 42300 ROANNE',
      categorieJuridiqueCode: '9220',
      codeInsee: '42187',
      codePostal: '42300',
      commune: 'ROANNE',
      denomination: 'Emmaus Connect',
      identifiant: '79227291600034',
      nomVoie: 'RTE DE LYON',
      numeroVoie: '172',
    })
    vi.spyOn(MettreAJourStructureDepuisEntreprise.prototype, 'handle').mockResolvedValueOnce('adresseIntrouvable')

    // WHEN
    const messages = await mettreAJourStructureLabelAction({
      path: '/label',
      siret: '79227291600034',
      structureId: 978,
    })

    // THEN
    expect(messages).toStrictEqual(['Adresse introuvable — vérifiez la saisie'])
  })
})

function stubGestionnaireBetaTesteur(): void {
  vi.spyOn(ssoGateway, 'getSessionUtilisateurId').mockResolvedValueOnce(1)
  vi.spyOn(PrismaUtilisateurLoader.prototype, 'findById').mockResolvedValueOnce(
    utilisateurReadModelFactory({
      isBetaTesteur: true,
      role: {
        categorie: 'structure',
        doesItBelongToGroupeAdmin: false,
        nom: 'Gestionnaire structure',
        organisation: 'Solidarnum',
        rolesGerables: ['gestionnaire_structure'],
        type: 'gestionnaire_structure',
      },
      structureId: 978,
    })
  )
  vi.spyOn(PrismaMembreLoader.prototype, 'getToutesAppartenancesParStructureId').mockResolvedValueOnce([])
}
