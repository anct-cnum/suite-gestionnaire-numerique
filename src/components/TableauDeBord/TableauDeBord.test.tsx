import { screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import TableauDeBord from './TableauDeBord'
import { gouvernancePresenter } from '@/presenters/tableauDeBord/gouvernancePresenter'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBord/tableauDeBordPresenter'

// Mock du composant Carte
vi.mock('../shared/Carte/Carte', () => ({
  // eslint-disable-next-line vitest/require-mock-type-parameters
  default: vi.fn(() => (
    <div data-testid="carte-mock">
      Carte mockée
    </div>)),
}))

describe('tableau de bord', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('quand j\'affiche le tableau de bord, alors il s\'affiche avec toutes ses informations', () => {
    // WHEN
    afficherMonTableauDeBord()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: '👋 Bonjour Martin Bienvenue sur l\'outil de pilotage de l\'Inclusion Numérique · 69' })
    expect(titre).toBeInTheDocument()

    const tachesSection = screen.getByRole('region', { name: 'Tâches à réaliser' })
    const tachesTitre = within(tachesSection).getByRole('heading', { level: 2, name: 'Tâches à réaliser' })
    expect(tachesTitre).toBeInTheDocument()
    const taches = within(tachesSection).getByRole('list')
    const tacheItems = within(taches).getAllByRole('listitem')
    expect(tacheItems).toHaveLength(3)
    const demandeLabel = within(tacheItems[0]).getByText('👉 7 demandes de postes à traiter')
    expect(demandeLabel).toBeInTheDocument()
    const demandeContexte = within(tacheItems[0]).getByText('Conseillers Numériques')
    expect(demandeContexte).toBeInTheDocument()
    const demandeLien = within(tacheItems[0]).getByRole('link', { name: 'Traiter les demandes' })
    expect(demandeLien).toHaveAttribute('href', '/')

    const renseignerLabel = within(tacheItems[1]).getByText('👉 Renseigner les actions et budget 2025')
    expect(renseignerLabel).toBeInTheDocument()
    const renseignerContexte = within(tacheItems[1]).getByText('Gouvernance')
    expect(renseignerContexte).toBeInTheDocument()
    const renseignerLien = within(tacheItems[1]).getByRole('link', { name: 'Compléter les actions' })
    expect(renseignerLien).toHaveAttribute('href', '/')

    const posteVacantLabel = within(tacheItems[2]).getByText('👉 8 postes vacants à traiter')
    expect(posteVacantLabel).toBeInTheDocument()
    const posteVacantContexte = within(tacheItems[2]).getByText('Conseillers Numériques')
    expect(posteVacantContexte).toBeInTheDocument()
    const posteVacantLien = within(tacheItems[2]).getByRole('link', { name: 'Les postes vacants' })
    expect(posteVacantLien).toHaveAttribute('href', '/')

    const etatDesLieuxSection = screen.getByRole('region', { name: 'État des lieux de l\'inclusion numérique' })
    const etatDesLieuxTitre = within(etatDesLieuxSection).getByRole('heading', { level: 2, name: 'État des lieux de l\'inclusion numérique' })
    expect(etatDesLieuxTitre).toBeInTheDocument()
    const etatDesLieuxSousTitre = within(etatDesLieuxSection).getByText('Source de données : Conseillers numériques, La Coop, Cartographie nationale des lieux d\'inclusion numérique, Aidants Connect, France Services', { selector: 'p' })
    expect(etatDesLieuxSousTitre).toBeInTheDocument()
    const etatDesLieuxLien = within(etatDesLieuxSection).getByRole('link', { name: 'Lieux d\'inclusion numérique' })
    expect(etatDesLieuxLien).toHaveAttribute('href', '/lieux-inclusion')
    const indice = within(etatDesLieuxSection).getByText('Indice de Fragilité numérique')
    expect(indice).toBeInTheDocument()
    const lieuxInclusionNombre = within(etatDesLieuxSection).getByText('479')
    expect(lieuxInclusionNombre).toBeInTheDocument()
    const lieuxInclusionTitre = within(etatDesLieuxSection).getAllByText('Lieux d\'inclusion numérique')
    expect(lieuxInclusionTitre[1]).toBeInTheDocument()
    const mediateursNumériquesNombre = within(etatDesLieuxSection).getByText('148')
    expect(mediateursNumériquesNombre).toBeInTheDocument()
    const mediateursNumériquesTitre = within(etatDesLieuxSection).getByText('Médiateurs et aidants numériques')
    expect(mediateursNumériquesTitre).toBeInTheDocument()
    const accompagnementsNombre = within(etatDesLieuxSection).getByText('48476')
    expect(accompagnementsNombre).toBeInTheDocument()
    const accompagnementsTitre = within(etatDesLieuxSection).getByText('Accompagnements réalisés')
    expect(accompagnementsTitre).toBeInTheDocument()

    const gouvernancesSection = screen.getByRole('region', { name: 'Gouvernances' })
    const gouvernancesTitre = within(gouvernancesSection).getByRole('heading', { level: 2, name: 'Gouvernances' })
    expect(gouvernancesTitre).toBeInTheDocument()
    const gouvernancesLien = within(gouvernancesSection).getByRole('link', { name: 'La gouvernance' })
    expect(gouvernancesLien).toHaveAttribute('href', '/gouvernance/69')
    const membresNombre = within(gouvernancesSection).getByText('9')
    expect(membresNombre).toBeInTheDocument()
    const membresTitre = within(gouvernancesSection).getByText('Membres de la gouvernance')
    expect(membresTitre).toBeInTheDocument()
    const membresSousTitre = within(gouvernancesSection).getByText(matchWithoutMarkup('dont 3 coporteurs'))
    expect(membresSousTitre).toBeInTheDocument()
    const collectivitesNombre = within(gouvernancesSection).getByText('3')
    expect(collectivitesNombre).toBeInTheDocument()
    const collectivitesTitre = within(gouvernancesSection).getByText('Collectivité impliquées')
    expect(collectivitesTitre).toBeInTheDocument()
    const collectivitesSousTitre = within(gouvernancesSection).getByText(matchWithoutMarkup('sur les 9 membres'))
    expect(collectivitesSousTitre).toBeInTheDocument()
    const feuillesDeRouteNombre = within(gouvernancesSection).getByText('1')
    expect(feuillesDeRouteNombre).toBeInTheDocument()
    const feuillesDeRouteTitre = within(gouvernancesSection).getByText('Feuilles de route déposées')
    expect(feuillesDeRouteTitre).toBeInTheDocument()
    const feuillesDeRouteSousTitre = within(gouvernancesSection).getByText(matchWithoutMarkup('comprenant 3 actions enregistrées'))
    expect(feuillesDeRouteSousTitre).toBeInTheDocument()

    const conventionnementSection = screen.getByRole('region', { name: 'Financements' })
    const conventionnementTitre = within(conventionnementSection).getByRole('heading', { level: 2, name: 'Financements' })
    expect(conventionnementTitre).toBeInTheDocument()
    const conventionnementSousTitre = within(conventionnementSection).getByText('Chiffres clés des budgets et financements', { selector: 'p' })
    expect(conventionnementSousTitre).toBeInTheDocument()
    const conventionnementLien = within(conventionnementSection).getByRole('link', { name: 'Les demandes' })
    expect(conventionnementLien).toHaveAttribute('href', '/gouvernance/69/financements')
    const budgetNombre = within(conventionnementSection).getByText('225 000 €')
    expect(budgetNombre).toBeInTheDocument()
    const budgetTitre = within(conventionnementSection).getByText('Budget global renseigné')
    expect(budgetTitre).toBeInTheDocument()
    const budgetSousTitre = within(conventionnementSection).getByText(matchWithoutMarkup('pour 1 feuille de route'))
    expect(budgetSousTitre).toBeInTheDocument()
    const creditsNombre = within(conventionnementSection).getByText('118 000 €')
    expect(creditsNombre).toBeInTheDocument()
    const creditsTitre = within(conventionnementSection).getByText('Financements engagés par l\'État')
    expect(creditsTitre).toBeInTheDocument()
    const creditsSousTitre = within(conventionnementSection).getByText(matchWithoutMarkup('Soit 25 % de votre budget global'))
    expect(creditsSousTitre).toBeInTheDocument()
    const financementEngage = within(conventionnementSection).getByText('4 financement(s) engagé(s) par l\'État')
    expect(financementEngage).toBeInTheDocument()
    const financements = within(conventionnementSection).getByRole('list')
    const financementsItems = within(financements).getAllByRole('listitem')
    expect(financementsItems).toHaveLength(4)
    const financements1Label = within(financementsItems[0]).getByText('Conseiller Numérique - 2024 - État')
    expect(financements1Label).toBeInTheDocument()
    const financements1Montant = within(financementsItems[0]).getByText('40 000 €')
    expect(financements1Montant).toBeInTheDocument()
    const financements2Label = within(financementsItems[1]).getByText('Conseiller Numérique - Plan France Relance - État')
    expect(financements2Label).toBeInTheDocument()
    const financements2Montant = within(financementsItems[1]).getByText('25 000 €')
    expect(financements2Montant).toBeInTheDocument()
    const financements3Label = within(financementsItems[2]).getByText('Formation Aidant Numérique/Aidants Connect - 2024 - État')
    expect(financements3Label).toBeInTheDocument()
    const financements3Montant = within(financementsItems[2]).getByText('30 000 €')
    expect(financements3Montant).toBeInTheDocument()
    const financements4Label = within(financementsItems[3]).getByText('Ingénierie France Numérique Ensemble - 2024 - État')
    expect(financements4Label).toBeInTheDocument()
    const financements4Montant = within(financementsItems[3]).getByText('20 000 €')
    expect(financements4Montant).toBeInTheDocument()

    const beneficiairesSection = screen.getByRole('region', { name: 'Bénéficiaires de financement(s)' })
    const beneficiairesTitre = within(beneficiairesSection).getByRole('heading', { level: 2, name: 'Bénéficiaires de financement(s)' })
    expect(beneficiairesTitre).toBeInTheDocument()
    const beneficiairesSousTitre = within(beneficiairesSection).getByText('Chiffres clés sur les bénéficiaires de financement(s)', { selector: 'p' })
    expect(beneficiairesSousTitre).toBeInTheDocument()
    const beneficiairesLien = within(beneficiairesSection).getByRole('link', { name: 'Les conventions' })
    expect(beneficiairesLien).toHaveAttribute('href', '/gouvernance/69/beneficiaires')
    const beneficiaireNombre = within(beneficiairesSection).getByText('66')
    expect(beneficiaireNombre).toBeInTheDocument()
    const beneficiaireTitre = within(beneficiairesSection).getByText('Bénéficiaires')
    expect(beneficiaireTitre).toBeInTheDocument()
    const beneficiaireSousTitre = within(beneficiairesSection).getByText('dont 1 256 collectivités')
    expect(beneficiaireSousTitre).toBeInTheDocument()
    const beneficiairesParFinancements = within(beneficiairesSection).getByText('Nombre de bénéficiaires par financements')
    expect(beneficiairesParFinancements).toBeInTheDocument()
    const beneficiaires = within(beneficiairesSection).getByRole('list')
    const beneficiairesItems = within(beneficiaires).getAllByRole('listitem')
    expect(beneficiairesItems).toHaveLength(4)
    const beneficiaires1Label = within(beneficiairesItems[0]).getByText('Conseiller Numérique - 2024 - État')
    expect(beneficiaires1Label).toBeInTheDocument()
    const beneficiaires1Montant = within(beneficiairesItems[0]).getByText('20')
    expect(beneficiaires1Montant).toBeInTheDocument()
    const beneficiaires2Label = within(beneficiairesItems[1]).getByText('Conseiller Numérique - Plan France Relance - État')
    expect(beneficiaires2Label).toBeInTheDocument()
    const beneficiaires2Montant = within(beneficiairesItems[1]).getByText('16')
    expect(beneficiaires2Montant).toBeInTheDocument()
    const beneficiaires3Label = within(beneficiairesItems[2]).getByText('Formation Aidant Numérique/Aidants Connect - 2024 - État')
    expect(beneficiaires3Label).toBeInTheDocument()
    const beneficiaires3Montant = within(beneficiairesItems[2]).getByText('15')
    expect(beneficiaires3Montant).toBeInTheDocument()
    const beneficiaires4Label = within(beneficiairesItems[3]).getByText('Ingénierie France Numérique Ensemble - 2024 - État')
    expect(beneficiaires4Label).toBeInTheDocument()
    const beneficiaires4Montant = within(beneficiairesItems[3]).getByText('15')
    expect(beneficiaires4Montant).toBeInTheDocument()
    const beneficiairePeutCumuler = within(beneficiairesSection).getByText('Un bénéficiaire peut cumuler plusieurs financements.', { selector: 'p' })
    expect(beneficiairePeutCumuler).toBeInTheDocument()

    const aidantsMediateursSection = screen.getByRole('region', { name: 'Aidants et médiateurs numériques' })
    const aidantsMediateursTitre = within(aidantsMediateursSection).getByRole('heading', { level: 2, name: 'Aidants et médiateurs numériques' })
    expect(aidantsMediateursTitre).toBeInTheDocument()
    const aidantsMediateursSousTitre = within(aidantsMediateursSection).getByText('Chiffres clés sur les médiateurs de l\'inclusion numérique', { selector: 'p' })
    expect(aidantsMediateursSousTitre).toBeInTheDocument()
    const aidantsMediateursLien = within(aidantsMediateursSection).getByRole('link', { name: 'Les aidants et médiateurs' })
    expect(aidantsMediateursLien).toHaveAttribute('href', '/aidants-et-mediateurs')
    const aidantNombre = within(aidantsMediateursSection).getByText('63')
    expect(aidantNombre).toBeInTheDocument()
    const aidantTitre = within(aidantsMediateursSection).getByText('Médiateurs numériques')
    expect(aidantTitre).toBeInTheDocument()
    const dont = within(aidantsMediateursSection).getAllByText('Dont')
    expect(dont).toHaveLength(2)
    const mediateurs = within(aidantsMediateursSection).getAllByRole('list')
    const mediateursItems = within(mediateurs[0]).getAllByRole('listitem')
    expect(mediateursItems).toHaveLength(5)
    const mediateurs1Label = within(mediateursItems[0]).getByText('Coordinateurs')
    expect(mediateurs1Label).toBeInTheDocument()
    const mediateurs1Montant = within(mediateursItems[0]).getByText('1')
    expect(mediateurs1Montant).toBeInTheDocument()
    const mediateurs2Label = within(mediateursItems[1]).getByText('Coordinateurs Conseillers numériques')
    expect(mediateurs2Label).toBeInTheDocument()
    const mediateurs2Montant = within(mediateursItems[1]).getByText('1')
    expect(mediateurs2Montant).toBeInTheDocument()
    const mediateurs3Label = within(mediateursItems[2]).getByText('Conseillers numériques')
    expect(mediateurs3Label).toBeInTheDocument()
    const mediateurs3Montant = within(mediateursItems[2]).getByText('41')
    expect(mediateurs3Montant).toBeInTheDocument()
    const mediateurs4Label = within(mediateursItems[3]).getByText('Conseillers numériques habilités Aidants Connect')
    expect(mediateurs4Label).toBeInTheDocument()
    const mediateurs4Montant = within(mediateursItems[3]).getByText('5')
    expect(mediateurs4Montant).toBeInTheDocument()
    const mediateurs5Label = within(mediateursItems[4]).getByText('Médiateurs non-habilités Aidants Connect')
    expect(mediateurs5Label).toBeInTheDocument()
    const mediateurs5Montant = within(mediateursItems[4]).getByText('5')
    expect(mediateurs5Montant).toBeInTheDocument()

    const aidantsNombre = within(aidantsMediateursSection).getByText('85')
    expect(aidantsNombre).toBeInTheDocument()
    const aidantsTitre = within(aidantsMediateursSection).getByText('Aidants numériques')
    expect(aidantsTitre).toBeInTheDocument()

    const aidantsItems = within(mediateurs[1]).getAllByRole('listitem')
    expect(aidantsItems).toHaveLength(2)
    const aidants1Label = within(aidantsItems[0]).getByText('Aidants habilités Aidants Connect')
    expect(aidants1Label).toBeInTheDocument()
    const aidants1Montant = within(aidantsItems[0]).getByText('65')
    expect(aidants1Montant).toBeInTheDocument()
    const aidants2Label = within(aidantsItems[1]).getByText('Aidants numériques formés sur AC 2024 Etat')
    expect(aidants2Label).toBeInTheDocument()
    const aidants2Montant = within(aidantsItems[1]).getByText('20')
    expect(aidants2Montant).toBeInTheDocument()

    const sourceSection = screen.getByRole('region', { name: 'Sources et données utilisées' })
    const sourceTitre = within(sourceSection).getByRole('heading', { level: 2, name: 'Sources et données utilisées' })
    expect(sourceTitre).toBeInTheDocument()
    const sourceSousTitre = within(sourceSection).getByText('Gravida malesuada tellus cras eu risus euismod pellentesque viverra. Enim facilisi vitae sem mauris quis massa vulputate nunc. Blandit sed aenean ullamcorper diam. In donec et in duis magna.', { selector: 'p' })
    expect(sourceSousTitre).toBeInTheDocument()
    const sourceLien = within(sourceSection).getByRole('link', { name: 'En savoir plus' })
    expect(sourceLien).toOpenInNewTab('Sources et données utilisées')
  })

  it('quand il y a une erreur dans les données de gouvernance, alors l\'erreur s\'affiche correctement', () => {
    // WHEN
    const tableauDeBordViewModel = tableauDeBordPresenter('69')
    const gouvernanceViewModel = gouvernancePresenter({
      message: 'Erreur lors du chargement des données de gouvernance',
      type: 'error',
    })

    renderComponent(
      <TableauDeBord
        accompagnementsRealisesViewModel={{
          departement: '69',
          graphique: {
            backgroundColor: ['#000000'],
            data: [48_476],
            labels: ['2024'],
          },
          nombreTotal: '48476',
        }}
        departement="69"
        financementsViewModel={{
          budget: {
            feuillesDeRouteWording: '1 feuille de route',
            total: '225 000 €',
          },
          credit: {
            pourcentage: 25,
            total: '118 000 €',
          },
          nombreDeFinancementsEngagesParLEtat: 4,
          ventilationSubventionsParEnveloppe: [],
        }}
        gouvernanceViewModel={gouvernanceViewModel}
        indicesFragilite={[]}
        lieuxInclusionViewModel={{
          departement: '69',
          nombreLieux: '479',
        }}
        mediateursEtAidantsViewModel={{
          departement: '69',
          nombreAidants: '85',
          nombreMediateurs: '63',
          total: '148',
        }}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    )

    // THEN
    const gouvernancesSection = screen.getByRole('region', { name: 'Gouvernances' })
    const gouvernancesTitre = within(gouvernancesSection).getByRole('heading', { level: 2, name: 'Gouvernances' })
    expect(gouvernancesTitre).toBeInTheDocument()

    // Vérifier que les erreurs s'affichent
    const erreurs = within(gouvernancesSection).getAllByText('Erreur lors du chargement des données')
    expect(erreurs).toHaveLength(3)

    // Vérifier que les valeurs sont remplacées par des tirets
    const tirets = within(gouvernancesSection).getAllByText('-')
    expect(tirets).toHaveLength(3)
  })

  function afficherMonTableauDeBord(): void {
    const tableauDeBordViewModel = tableauDeBordPresenter('69')
    const gouvernanceViewModel = gouvernancePresenter({
      collectivite: {
        membre: 9,
        total: 3,
      },
      feuilleDeRoute: {
        action: 3,
        total: 1,
      },
      membre: {
        coporteur: 3,
        total: 9,
      },
    })

    renderComponent(
      <TableauDeBord
        accompagnementsRealisesViewModel={{
          departement: '69',
          graphique: {
            backgroundColor: ['#000000'],
            data: [48_476],
            labels: ['2024'],
          },
          nombreTotal: '48476',
        }}
        departement="69"
        financementsViewModel={{
          budget: {
            feuillesDeRouteWording: '1 feuille de route',
            total: '225 000 €',
          },
          credit: {
            pourcentage: 25,
            total: '118 000 €',
          },
          nombreDeFinancementsEngagesParLEtat: 4,
          ventilationSubventionsParEnveloppe: [
            {
              color: 'dot-purple-glycine-main-494',
              label: 'Conseiller Numérique - 2024 - État',
              total: '40 000 €',
            },
            {
              color: 'dot-purple-glycine-850-200',
              label: 'Conseiller Numérique - Plan France Relance - État',
              total: '25 000 €',
            },
            {
              color: 'dot-green-tilleul-verveine-925',
              label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
              total: '30 000 €',
            },
            {
              color: 'dot-orange-terre-battue-850-200',
              label: 'Ingénierie France Numérique Ensemble - 2024 - État',
              total: '20 000 €',
            },
          ],
        }}
        gouvernanceViewModel={gouvernanceViewModel}
        indicesFragilite={[]}
        lieuxInclusionViewModel={{
          departement: '69',
          nombreLieux: '479',
        }}
        mediateursEtAidantsViewModel={{
          departement: '69',
          nombreAidants: '85',
          nombreMediateurs: '63',
          total: '148',
        }}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    )
  }
})
