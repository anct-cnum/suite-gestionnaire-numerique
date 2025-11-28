'use client'

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export function AccompagnementPieChart({
  className,
  colors = [],
  data,
  isAnimationActive = true,
  size,
  width = 24,
}: {
  readonly className?: string
  readonly colors?: Array<string>
  readonly data: Array<{ count: number; label: string; proportion: number }>
  readonly isAnimationActive?: boolean
  readonly size: number
  readonly width?: number
}) {
  return (<ResponsiveContainer
    className={className}
    height={size}
    width={size}
          >
    <PieChart>
      <Pie
        cx="50%"
        cy="50%"
        data={data}
        dataKey="count"
        innerRadius={size / 2 - width}
        isAnimationActive={isAnimationActive}
        nameKey="label"
        outerRadius={size / 2}
        strokeWidth={0}
      >
        {data.map((item, index) => (
          <Cell
            fill={colors[index % colors.length]}
            key={item.label}
          />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
    </PieChart>
          </ResponsiveContainer>)
}

type TooltipPayload = {
  name: string
  value: number
}

function CustomTooltip({
  active,
  payload,
}: {
  readonly active?: boolean
  readonly payload?: Array<TooltipPayload>
}) {
  return active &&
  payload &&
  payload.length > 0 && (
    <div className="fr-background-default--grey fr-p-1w fr-list-group fr-tile--shadow fr-whitespace-nowrap">
      {payload[0].name}
      {' '}
      :
      {' '}
      <span className="fr-text--bold">
        {payload[0].value}
      </span>
    </div>
  )
}
