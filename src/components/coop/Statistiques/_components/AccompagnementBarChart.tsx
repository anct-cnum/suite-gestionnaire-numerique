'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  TooltipValueType,
  XAxis,
  YAxis,
} from 'recharts'

import { accompagnementsAffiches } from '@/presenters/statistiquesPresenter'

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<TooltipValueType, number | string>) =>
  active &&
  payload &&
  payload.length > 0 && (
    <div
      className="fr-p-2v fr-border-radius--8 fr-tile--shadow fr-whitespace-nowrap fr-text--sm"
      style={{ backgroundColor: 'rgba(30, 27, 57, 0.95)', color: 'white' }}
    >
      <div className="fr-text--bold">{label}</div>
      <div>
        <span className="fr-text--xs">Accompagnements&nbsp;:</span>{' '}
        <span className="fr-text--bold">{Number(payload[0].value).toLocaleString('fr-FR')}</span>
      </div>
    </div>
  )

// Taille de fr-text--xxs, en rem pour suivre le zoom du texte
const TAILLE_DES_GRADUATIONS = { fontSize: '0.75rem' }

const MARGE_ENTRE_LES_DATES = 8

export const AccompagnementBarChart = ({ data }: { data: { label: string; count: number }[] }) => {
  const isEmpty = data.length === 0 || data.every((item) => item.count === 0)
  const slicedData = accompagnementsAffiches(data)
  const emptyData = slicedData.map((item) => ({ ...item, count: 1 }))
  const displayData = isEmpty ? emptyData : slicedData

  return (
    <ResponsiveContainer width="100%" height="100%">
      {/* #2251 : sans couche « application » ni tabulation ; le parent masque le graphique, doublé d'un tableau */}
      <BarChart
        accessibilityLayer={false}
        data={displayData}
        margin={{ top: 15, right: 10, left: 5, bottom: 0 }}
        barSize={displayData.length > 18 ? 16 : 20}
      >
        <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" stroke="#ddd" />
        {/* #2382 : les graduations sont rendues hors du groupe de l'axe, une classe CSS n'y arrive pas : leur taille
            passe par `tick`. Recharts mesure ensuite chaque date et n'affiche que celles qui tiennent sans se toucher,
            à intervalle régulier, la dernière toujours visible ; toutes restent dans le tableau (#2251) */}
        <XAxis
          dataKey="label"
          scale="point"
          padding={{ left: 14, right: 14 }}
          tick={TAILLE_DES_GRADUATIONS}
          tickLine={false}
          axisLine={false}
          interval="equidistantPreserveEnd"
          minTickGap={MARGE_ENTRE_LES_DATES}
        />
        {/* #2382 : largeur ajustée aux valeurs pour qu'aucune ne soit coupée */}
        <YAxis
          width="auto"
          tick={TAILLE_DES_GRADUATIONS}
          tickCount={5}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={isEmpty ? [0, 1] : undefined}
          tickFormatter={(value) => (isEmpty ? '' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString())}
        />
        {!isEmpty && <Tooltip content={CustomTooltip} />}
        <Bar dataKey="count" fill={isEmpty ? 'var(--blue-france-975-75)' : '#6a6af4'} radius={[4, 4, 0, 0]}>
          {!isEmpty && (
            <LabelList
              dataKey="count"
              position="top"
              style={{
                fontSize: displayData.length > 12 ? 10 : 12,
                fontWeight: 'bold',
              }}
              formatter={(label) => {
                const count = Number(label)
                if (count === 0) return ''
                if (count >= 1000) {
                  return `${(count / 1000).toFixed(1)}k`
                }
                return count.toString()
              }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
