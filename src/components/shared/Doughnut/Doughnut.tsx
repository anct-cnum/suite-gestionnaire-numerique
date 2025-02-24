import { ReactElement } from 'react'
import { Doughnut as ReactDoughnut } from 'react-chartjs-2'

export default function Doughnut({ backgroundColor, data, labels }: Props): ReactElement {
  return (
    <ReactDoughnut
      data={{
        datasets: [
          {
            backgroundColor,
            borderWidth: 0,
            data,
          },
        ],
        labels,
      }}
      options={{
        circumference: 180,
        cutout: '80%',
        plugins: {
          legend: {
            display: false,
          },
        },
        rotation: -90,
      }}
    />
  )
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  labels: Array<string>
}>
