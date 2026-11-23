import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import DetailActionVitrine from './DetailActionVitrine'
import FeuilleDeRouteVitrine from './FeuilleDeRouteVitrine'
import { simulerResizeObserver } from '@/components/testHelper'
import { FeuilleDeRouteViewModel, feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { epochTime } from '@/shared/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('feuilles de route du site vitrine', () => {
  beforeEach(() => {
    simulerResizeObserver()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('le document de chaque feuille de route est présenté sous un titre de niveau 3, dans la zone de sa feuille de route, sans zone propre', () => {
    // GIVEN
    const [premiere, seconde] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
        { ...seconde, pieceJointe: { chemin: 'user/1/seconde.pdf', nom: 'seconde.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    for (const nom of ['Feuille de route 1', 'Feuille de route 2']) {
      const zone = screen.getByRole('region', { name: nom })
      within(zone).getByRole('heading', { level: 3, name: 'Document de la feuille de route' })
      within(zone).getByRole('link', { name: `Télécharger la feuille de route « ${nom} » PDF` })
    }
    expect(screen.queryAllByRole('region', { name: 'Document de la feuille de route' })).toHaveLength(0)
  })

  it('le lien de téléchargement annonce le format déduit de l’extension et le poids lu dans le stockage', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...premiere,
          pieceJointe: { chemin: 'user/1/doc.odt', nom: 'Feuille de route.odt', poids: 1_638_400, upload: epochTime },
        },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const lien = screen.getByRole('link', {
      name: 'Télécharger la feuille de route « Feuille de route 1 » ODT – 1,6 Mo',
    })
    expect(lien.getAttribute('href')).toBe('/api/document-feuille-de-route/user/1/doc.odt')
    expect(lien.hasAttribute('download')).toBe(true)
    expect(lien.getAttribute('target')).toBeNull()
  })

  it('le document cite la structure porteuse comme source, ou le territoire quand il n’y en a pas', () => {
    // GIVEN
    const [premiere, , troisieme] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
        { ...troisieme, pieceJointe: { chemin: 'user/3/troisieme.pdf', nom: 'troisieme.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const avecPorteur = screen.getByRole('region', { name: 'Feuille de route 1' })
    expect(
      within(avecPorteur).getByText('Document fourni par CC des Monts du Lyonnais, mis en ligne le 01/01/1970.')
    ).not.toBeNull()
    const sansPorteur = screen.getByRole('region', { name: 'Feuille de route 3' })
    expect(
      within(sansPorteur).getByText('Document fourni par le territoire, mis en ligne le 01/01/1970.')
    ).not.toBeNull()
  })

  it('le document avertit que son accessibilité n’est pas garantie et renvoie vers la déclaration d’accessibilité', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        { ...premiere, pieceJointe: { chemin: 'user/1/premiere.pdf', nom: 'premiere.pdf', upload: epochTime } },
      ],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    const avertissement = screen.getByText(/^L’accessibilité de ce document/)
    expect(avertissement.textContent).toBe(
      'L’accessibilité de ce document, rédigé par le territoire, n’est pas garantie. ' +
        'Pour en obtenir une version accessible, utilisez le contact indiqué dans la déclaration d’accessibilité.'
    )
    const lien = within(avertissement).getByRole('link', { name: 'déclaration d’accessibilité' })
    expect(lien.getAttribute('href')).toBe('/accessibilite')
  })

  it('une feuille de route sans document n’affiche ni bloc ni lien de téléchargement', () => {
    // GIVEN
    const [premiere] = feuillesDeRouteReadModelFactory().feuillesDeRoute
    const readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [{ ...premiere, pieceJointe: undefined }],
    })

    // WHEN
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRoutePresenter(readModel)} />)

    // THEN
    expect(screen.queryByRole('heading', { name: 'Document de la feuille de route' })).toBeNull()
    expect(screen.queryByRole('link', { name: /^Télécharger/ })).toBeNull()
  })

  describe('« Lire plus » de la description d’une action (RGAA 7.1, 7.3)', () => {
    it('replié, seul l’extrait visible est dans la page et le bouton annonce son état', () => {
      // GIVEN
      simulerMiseEnPage()

      // WHEN
      afficherLeDetail(DESCRIPTION_LONGUE)

      // THEN
      const bouton = screen.getByRole('button', { name: 'Lire plus' })
      expect(bouton).toHaveAttribute('aria-expanded', 'false')
      expect(bouton).toHaveAttribute('aria-controls', contenuDeLaDescription().id)
      expect(screen.getByText(/^Premier paragraphe/).textContent).toBe('Premier paragraphe de la description.')
      expect(screen.getByText(/^Deuxième paragraphe/).textContent).toBe(
        'Deuxième paragraphe, qui se poursuit sur plusieurs lignes du volet de détail de…'
      )
      expect(screen.queryByText(/l’action\./)).not.toBeInTheDocument()
      expect(screen.queryByText(/Troisième paragraphe/)).not.toBeInTheDocument()
    })

    it('déplié, le texte entier est ajouté, le focus va dessus et Tab mène à « Lire moins »', async () => {
      // GIVEN
      simulerMiseEnPage()
      afficherLeDetail(DESCRIPTION_LONGUE)

      // WHEN
      await userEvent.click(screen.getByRole('button', { name: 'Lire plus' }))

      // THEN
      const bouton = screen.getByRole('button', { name: 'Lire moins' })
      expect(bouton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(/^Deuxième paragraphe/).textContent).toBe(
        'Deuxième paragraphe, qui se poursuit sur plusieurs lignes du volet de détail de l’action.'
      )
      expect(screen.getByText(/^Troisième paragraphe/).textContent).toBe('Troisième paragraphe.')
      const contenu = contenuDeLaDescription()
      expect(contenu).toHaveFocus()
      expect(contenu.id).toBe(bouton.getAttribute('aria-controls'))
      await userEvent.tab()
      expect(bouton).toHaveFocus()
    })

    it('replié à nouveau, seul l’extrait reste et le focus reste sur le bouton', async () => {
      // GIVEN
      simulerMiseEnPage()
      afficherLeDetail(DESCRIPTION_LONGUE)
      await userEvent.click(screen.getByRole('button', { name: 'Lire plus' }))

      // WHEN
      await userEvent.click(screen.getByRole('button', { name: 'Lire moins' }))

      // THEN
      const bouton = screen.getByRole('button', { name: 'Lire plus' })
      expect(bouton).toHaveAttribute('aria-expanded', 'false')
      expect(bouton).toHaveFocus()
      expect(screen.queryByText(/Troisième paragraphe/)).not.toBeInTheDocument()
    })

    it('un texte qui tient dans les lignes visibles est affiché en entier, sans bouton', () => {
      // GIVEN
      simulerMiseEnPage()

      // WHEN
      afficherLeDetail('<p>Description courte.</p>')

      // THEN
      expect(screen.getByText('Description courte.')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Lire plus' })).not.toBeInTheDocument()
    })
  })

  it('le détail d’une action qui défile est une zone atteignable au clavier, nommée par le titre de l’action', async () => {
    // GIVEN
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(900)
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
    const viewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModelFactory())
    const action = viewModel.feuillesDeRoute[0].actions[0]
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={viewModel} />)

    // WHEN
    await userEvent.click(screen.getAllByRole('button', { name: action.nom })[0])

    // THEN
    expect(screen.getByRole('region', { name: action.nom })).toHaveAttribute('tabindex', '0')
  })

  it('le détail d’une action qui tient dans le volet n’ajoute pas d’arrêt de tabulation', async () => {
    // GIVEN
    const viewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModelFactory())
    const action = viewModel.feuillesDeRoute[0].actions[0]
    render(<FeuilleDeRouteVitrine feuillesDeRouteViewModel={viewModel} />)

    // WHEN
    await userEvent.click(screen.getAllByRole('button', { name: action.nom })[0])

    // THEN
    expect(screen.getByRole('region', { name: action.nom })).not.toHaveAttribute('tabindex')
  })
})

const DESCRIPTION_LONGUE =
  '<p>Premier paragraphe de la description.</p>' +
  '<p>Deuxième paragraphe, qui se poursuit sur plusieurs lignes du volet de détail de l’action.</p>' +
  '<p>Troisième paragraphe.</p>'

// jsdom ne met pas en page : lignes de 24px, 40 caractères par ligne, chaque paragraphe commence une ligne
function simulerMiseEnPage(): void {
  const hauteurDeLigne = 24
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300)
  const styleCalcule = window.getComputedStyle
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
    Object.assign(styleCalcule(element), { lineHeight: `${hauteurDeLigne}px` })
  )
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function hauteur(this: HTMLElement) {
    return this.innerHTML
      .split('</p>')
      .map((paragraphe) => paragraphe.replace('<p>', ''))
      .reduce((total, texte) => total + Math.ceil(texte.length / 40) * hauteurDeLigne, 0)
  })
}

// Le conteneur du texte n'a pas de rôle : c'est lui que désigne aria-controls et qui reçoit le focus
function contenuDeLaDescription(): HTMLElement {
  // eslint-disable-next-line testing-library/no-node-access
  const contenu = screen.getByText(/^Premier paragraphe/).parentElement
  if (contenu === null) {
    throw new Error('le texte de la description n’a pas de conteneur')
  }
  return contenu
}

function afficherLeDetail(description: string): void {
  const action: FeuilleDeRouteViewModel['actions'][number] = {
    ...feuillesDeRoutePresenter(feuillesDeRouteReadModelFactory()).feuillesDeRoute[0].actions[0],
    description,
  }
  render(<DetailActionVitrine action={action} labelId="titre-action" />)
}
