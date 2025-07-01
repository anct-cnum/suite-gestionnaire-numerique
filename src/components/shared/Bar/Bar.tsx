import { ReactElement } from 'react'
import { Bar as ReactBar } from 'react-chartjs-2'

import Information from '@/components/shared/Information/Information'

export default function Bar({ backgroundColor, data, labels }: Props): ReactElement {
  return (
    <>
      <div className="font-weight-500">
        <span>
          {' '}
          Evolution des accompagnements
        </span>
        <Information label="Répartition des accompagnements saisis sur la Coop lors des 6 derniers mois" />
      </div>
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
  labels: Array<string>
}>
