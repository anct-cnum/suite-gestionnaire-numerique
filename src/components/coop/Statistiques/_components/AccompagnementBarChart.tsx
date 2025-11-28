'use client'

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function AccompagnementBarChart({
  data,
}: {
  readonly data: Array<{ count: number; label: string }>
}) {
  // Si plus de 12 éléments, on ne garde que les 30 dernières valeurs
  const displayData = data.length > 12 ? data.slice(-30) : data

  return (
    <ResponsiveContainer
      height={200}
      width="100%"
    >
      <BarChart
        barSize={displayData.length > 12 ? 6 : 16}
        data={displayData}
        margin={{ bottom: 10, left: 20, right: 30, top: 15 }}
      >
        <XAxis
          angle={-45}
          className="fr-text--sm fr-text--medium"
          dataKey="label"
          interval={displayData.length > 12 ? 2 : 0}
          padding={{ left: 10, right: 10 }}
          scale="point"
          tick={{ dy: 10 }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          className="fr-text--sm fr-text--medium"
          interval="preserveStartEnd"
          tickFormatter={(value: number) => {
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}k`
            }
            return value.toString()
          }}
          tickMargin={15}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          fill="#009099"
          radius={[10, 10, 0, 0]}
        >
          <LabelList
            dataKey="count"
            formatter={(value: number | string | undefined | null | false) => {
              if (value === undefined || value === null || value === false) {return ''}
              const count = typeof value === 'number' ? value : Number(value)
              if (count === 0 || isNaN(count)) {return ''}
              if (count >= 1000) {
                return `${(count / 1000).toFixed(1)}k`
              }
              return count.toString()
            }}
            position="top"
            style={{
              fontSize: displayData.length > 12 ? 10 : 12,
              fontWeight: 'bold',
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

type TooltipPayload = {
  payload: { label: string }
  value: number
}

function CustomTooltip({
  active,
  label,
  payload,
}: {
  readonly active?: boolean
  readonly label?: string
  readonly payload?: Array<TooltipPayload>
}) {
  return active &&
  payload &&
  payload.length > 0 && (
    <ul className="fr-background-default--grey fr-p-1w fr-list-group fr-raw-list fr-tile--shadow">
      <li className="fr-text--bold">
        {label}
      </li>
      <li>
        Accompagnements :
        {' '}
        <span className="fr-text--bold">
          {payload[0].value.toLocaleString('fr-FR')}
        </span>
      </li>
    </ul>
  )
}
