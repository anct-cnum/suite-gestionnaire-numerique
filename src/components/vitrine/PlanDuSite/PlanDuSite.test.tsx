import { render, screen, within } from '@testing-library/react'
import { readdirSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

import PlanDuSite from './PlanDuSite'

describe('plan du site de la vitrine', () => {
  it('est organisé par rubrique, comme le menu principal (RGAA 12.3)', () => {
    // WHEN
    render(<PlanDuSite />)

    // THEN
    expect(screen.getByRole('heading', { level: 1, name: 'Plan du site' })).toBeInTheDocument()
    const rubriques = screen.getAllByRole('heading', { level: 2 }).map((titre) => titre.textContent)
    expect(rubriques).toStrictEqual([
      'Accueil',
      'Lieux',
      'Dispositifs',
      'Données territoriales',
      'Outils numériques',
      'Études et enquêtes',
      'Informations légales',
    ])
    const filAriane = screen.getByRole('navigation', { name: 'vous êtes ici :' })
    expect(within(filAriane).getByText('Plan du site')).toHaveAttribute('aria-current', 'page')
  })

  it('donne accès à toutes les pages de la vitrine (RGAA 12.3)', () => {
    // WHEN
    render(<PlanDuSite />)

    // THEN
    const adresses = adressesDuPlan()
    const pagesNonListees = pagesDeLaVitrine().filter((page) => {
      if (page === '/plan-du-site') {
        return false
      }
      if (page.endsWith('/*')) {
        const rubrique = page.slice(0, -'/*'.length)
        return !adresses.some((adresse) => adresse.startsWith(`${rubrique}/`)) && !(rubrique in pagesParDepartement)
      }
      return !adresses.includes(page)
    })
    expect(pagesNonListees).toStrictEqual([])
  })

  it('explique comment consulter les rubriques qui n’existent que par département', () => {
    // WHEN
    render(<PlanDuSite />)

    // THEN
    const explication = screen.getByText(/se consultent par département/)
    Object.values(pagesParDepartement).forEach((libelle) => {
      expect(explication.textContent).toContain(libelle)
    })
  })

  it('pointe vers les adresses publiques, sans le préfixe technique /vitrine', () => {
    // WHEN
    render(<PlanDuSite />)

    // THEN
    const adresses = adressesDuPlan()
    expect(adresses.filter((adresse) => adresse.startsWith('/vitrine'))).toStrictEqual([])
  })

  it('signale les liens externes qui ouvrent une nouvelle fenêtre', () => {
    // WHEN
    render(<PlanDuSite />)

    // THEN
    const liens = [
      screen.getByRole('link', { name: 'Études' }),
      screen.getByRole('link', { name: 'Labo Société Numérique' }),
    ]
    expect(liens.map((lien) => lien.getAttribute('title'))).toStrictEqual([
      'Études - nouvelle fenêtre',
      'Labo Société Numérique - nouvelle fenêtre',
    ])
    liens.forEach((lien) => {
      expect(lien).toHaveAttribute('target', '_blank')
    })
  })
})

// Rubriques des données territoriales sans page nationale : le plan explique comment y accéder.
const pagesParDepartement: Readonly<Record<string, string>> = {
  '/donnees-territoriales/feuille-de-route': 'Feuille de route',
  '/donnees-territoriales/gouvernances': 'Gouvernances',
}

function adressesDuPlan(): ReadonlyArray<string> {
  return screen
    .getAllByRole('link')
    .map((lien) => lien.getAttribute('href') ?? '')
    .filter((adresse) => adresse.startsWith('/'))
}

// Adresses publiques des pages de src/app/vitrine ; une page par territoire est notée « rubrique/* ».
function pagesDeLaVitrine(): ReadonlyArray<string> {
  const racine = join(process.cwd(), 'src', 'app', 'vitrine')
  return readdirSync(racine, { recursive: true })
    .map(String)
    .filter((fichier) => fichier === 'page.tsx' || fichier.endsWith(`${sep}page.tsx`))
    .map((fichier) => {
      const segments = fichier
        .split(sep)
        .slice(0, -1)
        .filter((segment) => !segment.startsWith('('))
      const indexDynamique = segments.findIndex((segment) => segment.startsWith('['))
      if (indexDynamique === -1) {
        return `/${segments.join('/')}`
      }
      return `/${segments.slice(0, indexDynamique).join('/')}/*`
    })
}
