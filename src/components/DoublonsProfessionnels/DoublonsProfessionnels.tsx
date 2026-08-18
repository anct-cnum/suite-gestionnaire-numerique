'use client'

import { ReactElement } from 'react'

import { DoublonsProfessionnelsViewModel } from '@/presenters/doublonsProfessionnelsPresenter'

export default function DoublonsProfessionnels({ viewModel }: Props): ReactElement {
  return (
    <>
      <h1 className="fr-h3">Doublons de professionnels intra-source ({viewModel.total})</h1>
      <p className="fr-text--sm">
        Deux identifiants distincts de la même source pour le même nom sur la même structure administrative. Non
        fusionnables côté entrepôt : à résoudre à la source.
      </p>
      {viewModel.sections.length === 0 ? (
        <p>Aucun doublon détecté.</p>
      ) : (
        viewModel.sections.map((section) => (
          <div className="fr-table fr-table--sm" key={section.source}>
            <table>
              <caption>
                {section.libelle} ({section.doublons.length})
              </caption>
              <thead>
                <tr>
                  <th scope="col">Professionnel</th>
                  <th scope="col">Structure</th>
                  <th scope="col">Ids personne</th>
                  <th scope="col">Ids source</th>
                </tr>
              </thead>
              <tbody>
                {section.doublons.map((doublon) => (
                  <tr key={doublon.idsPersonne}>
                    <td>{doublon.nomComplet}</td>
                    <td>{doublon.structure}</td>
                    <td>{doublon.idsPersonne}</td>
                    <td className="fr-text--xs">{doublon.idsSource}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </>
  )
}

type Props = Readonly<{
  viewModel: DoublonsProfessionnelsViewModel
}>
