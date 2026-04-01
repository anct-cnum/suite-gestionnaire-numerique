import { ArcBorderRadius, ArcElement, Chart as ChartJS, Legend, ScriptableContext, Tooltip } from 'chart.js'
import { ReactElement } from 'react'
import { Doughnut as ReactDoughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const reverseSemiDoughnutDrawOrder = {
  afterDatasetsDraw(chart: ChartJS) {
    const meta = chart.getDatasetMeta(0)
    if (meta.data.length > 1) {
      meta.data.reverse()
    }
  },
  beforeDatasetsDraw(chart: ChartJS) {
    const meta = chart.getDatasetMeta(0)
    if (meta.data.length > 1) {
      meta.data.reverse()
    }
  },
  id: 'reverseSemiDoughnutDrawOrder',
}

export default function Doughnut({ backgroundColor, data, isFull = true, labels }: Props): ReactElement {
  return (
    <ReactDoughnut
      data={{
        datasets: [
          {
            backgroundColor,
            borderRadius: (context) => getBorderRadius(context, isFull),
            borderWidth: 0,
            clip: false,
            data,
            hoverBackgroundColor: backgroundColor,
            hoverOffset: 0,
            spacing: -12,
          },
        ],
        labels,
      }}
      options={{
        circumference: isFull ? 360 : 180,
        cutout: '80%',
        layout: {
          padding: isFull ? 0 : { left: 12, right: 12, top: 12 },
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        rotation: -90,
      }}
      plugins={isFull ? [] : [reverseSemiDoughnutDrawOrder]}
    />
  )
}

function getBorderRadius(context: ScriptableContext<'doughnut'>, isFull: boolean): ArcBorderRadius | number {
  if (isFull) {
    return 50
  }

  const lastDataIndex = context.dataset.data.length - 1

  if (context.dataIndex < lastDataIndex) {
    return 50
  }

  return {
    innerEnd: 50,
    innerStart: 0,
    outerEnd: 50,
    outerStart: 0,
  }
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  isFull?: boolean
  labels: Array<string>
}>
