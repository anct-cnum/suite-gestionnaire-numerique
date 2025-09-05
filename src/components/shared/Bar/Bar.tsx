import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { ReactElement, ReactNode } from 'react'
import { Bar as ReactBar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
)

export default function Bar({ backgroundColor, data, header, labels }: Props): ReactElement {
  return (
    <>
      {header}
      <ReactBar
        data={{
          datasets: [
            {
              backgroundColor,
              borderRadius: 5,
              data,
            },
          ],
          labels,
        }}
        options={{
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: false,
            },
            tooltip: {
              bodyFont: {
                size: 14,
              },
              titleFont: {
                size: 14,
              },
            },
          },
          scales: {
          // eslint-disable-next-line id-length
            x: {
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 14,
                },
              },
            },
            // eslint-disable-next-line id-length
            y: {
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
        }}
      />
    </>
  )
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  header?: ReactNode
  labels: Array<string>
}>
