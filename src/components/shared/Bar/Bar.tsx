import { ReactElement } from 'react'
import { Bar as ReactBar } from 'react-chartjs-2'

export default function Bar({ backgroundColor, data, labels }: Props): ReactElement {
  return (
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
  )
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  labels: Array<string>
}>
