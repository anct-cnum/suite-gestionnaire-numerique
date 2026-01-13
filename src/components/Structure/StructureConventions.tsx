'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { ReactElement } from 'react'

import Badge from '@/components/shared/Badge/Badge'
import Dot from '@/components/shared/Dot/Dot'
import Doughnut from '@/components/shared/Doughnut/Doughnut'
import Table from '@/components/shared/Table/Table'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureConventions({ conventionsEtFinancements }: Props): ReactElement {
  ChartJS.register(
    ArcElement,
    Tooltip
  )

  function convertirLibelleConvention(libelle: string): string {
    if (libelle === 'DGCL') {
      return 'Initial'
    }
    if (libelle === 'DITP' || libelle === 'DGE') {
      return 'Renouvellement'
    }
    return libelle
  }

  return (
    <section
      aria-labelledby="conventions"
      className="grey-border border-radius fr-mb-2w fr-p-4w"
      id="conventions"
      style={{ backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <h2
        className="fr-h6 fr-m-0"
        id="conventions"
      >
        Conventions et financements
      </h2>

      <article
        aria-label="Résumé des financements"
        className="grey-border border-radius fr-p-4w"
        style={{ display: 'flex', gap: '3.5rem', width: '100%' }}
      >
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '1rem' }}>
          <div
            className="fr-h6"
            style={{ display: 'flex', justifyContent: 'space-between', margin: 0 }}
          >
            <span>
              Crédits engagés par l&apos;état
            </span>
            <span>
              {conventionsEtFinancements.creditsEngagesParLEtat}
            </span>
          </div>
          <hr className="fr-pb-2w" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {conventionsEtFinancements.enveloppes.map((enveloppe) => (
              <div
                key={enveloppe.libelle}
                style={{ alignItems: 'center', display: 'flex', gap: '1rem', height: '1.25rem' }}
              >
                <div
                  className="fr-text--sm"
                  style={{ alignItems: 'center', display: 'flex', flex: 1, gap: '0.5rem', lineHeight: '1.25rem' }}
                >
                  <Dot color={colors[enveloppe.color].dot} />
                  {enveloppe.libelle}
                  <span
                    aria-label="Information"
                    className="fr-icon-information-line"
                    style={{ color: '#000091' }}
                  />
                </div>
                <span
                  className="fr-text--sm font-weight-700"
                  style={{ lineHeight: '1.25rem' }}
                >
                  {enveloppe.montantFormate}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', height: '8.5rem', padding: '0.5625rem', width: '8.5rem' }}>
          <Doughnut
            backgroundColor={conventionsEtFinancements.enveloppes.map(
              (enveloppe) => colors[enveloppe.color].color
            )}
            data={conventionsEtFinancements.enveloppes.map((enveloppe) => enveloppe.montant)}
            labels={conventionsEtFinancements.enveloppes.map((enveloppe) => enveloppe.libelle)}
          />
        </div>
      </article>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3
          className="fr-text--xs font-weight-700 fr-m-0"
          style={{ letterSpacing: '0', lineHeight: '1.25rem', textTransform: 'uppercase' }}
        >
          Conventions Conseiller Numérique
        </h3>
        <Table
          enTetes={['Convention', 'Statut', 'Date de début', 'Date de fin', 'Bonnification', 'Total conventionné', 'Total versé']}
          titre="Conventions Conseiller Numérique"
        >
          {conventionsEtFinancements.conventions.map((convention) => (
            <tr key={convention.id}>
              <td className="font-weight-700">
                {convertirLibelleConvention(convention.libelle)}
              </td>
              <td>
                <Badge color={convention.statut.variant}>
                  {convention.statut.libelle}
                </Badge>
              </td>
              <td className="color-grey">
                {convention.dateDebut}
              </td>
              <td className="color-grey">
                {convention.dateFin}
              </td>
              <td className="color-grey text-right">
                {convention.montantBonification}
              </td>
              <td className="color-grey text-right">
                {convention.montantTotal}
              </td>
              <td className="text-right font-weight-500">
                {convention.montantSubvention}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </section>
  )
}

type Props = Readonly<{
  conventionsEtFinancements: StructureViewModel['conventionsEtFinancements']
}>

const colors = {
  france: {
    color: '#6a6af4',
    dot: 'dot-blue-france-main-525',
  },
  menthe: {
    color: '#009081',
    dot: 'dot-green-menthe-main-548',
  },
  tilleul: {
    color: '#fbe769',
    dot: 'dot-green-tilleul-verveine-925',
  },
}
