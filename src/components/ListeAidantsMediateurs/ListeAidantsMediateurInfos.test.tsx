import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ListeAidantsMediateurInfos from './ListeAidantsMediateurInfos'

const viewModel = { totalActeursNumerique: 145, totalConseillersNumerique: 87 }

describe('liste aidants et médiateurs infos', () => {
  it("étant à un niveau département ou national sans filtre actif, quand j'affiche les infos, alors les encarts des 30 derniers jours s'affichent", async () => {
    // WHEN
    render(
      <ListeAidantsMediateurInfos
        hasActiveFilters={false}
        peutAfficherStatistiques30Jours
        totalAccompagnementsPromise={Promise.resolve(1250)}
        totalBeneficiairesPromise={Promise.resolve(980)}
        viewModel={viewModel}
      />
    )

    // THEN
    const legendes = await screen.findAllByText('sur les 30 derniers jours')
    expect(legendes.length).toBeGreaterThan(0)
  })

  it("étant à un niveau autre que département ou national, quand j'affiche les infos, alors les encarts des 30 derniers jours sont masqués", () => {
    // WHEN
    render(
      <ListeAidantsMediateurInfos
        hasActiveFilters={false}
        peutAfficherStatistiques30Jours={false}
        totalAccompagnementsPromise={Promise.resolve(1250)}
        totalBeneficiairesPromise={Promise.resolve(980)}
        viewModel={viewModel}
      />
    )

    // THEN
    expect(screen.queryByText('sur les 30 derniers jours')).not.toBeInTheDocument()
    expect(screen.getByText('Aidants et médiateurs numériques')).toBeInTheDocument()
  })

  it("étant avec des filtres actifs, quand j'affiche les infos, alors les encarts des 30 derniers jours sont masqués", () => {
    // WHEN
    render(
      <ListeAidantsMediateurInfos
        hasActiveFilters
        peutAfficherStatistiques30Jours
        totalAccompagnementsPromise={Promise.resolve(1250)}
        totalBeneficiairesPromise={Promise.resolve(980)}
        viewModel={viewModel}
      />
    )

    // THEN
    expect(screen.queryByText('sur les 30 derniers jours')).not.toBeInTheDocument()
  })
})
