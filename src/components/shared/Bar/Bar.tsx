import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Plugin, ScriptableContext, Tooltip } from 'chart.js'
import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { Bar as ReactBar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function Bar({
  backgroundColor,
  data,
  etiquettesValeurs,
  header,
  labels,
  nomAccessible,
  serieEmpilee,
  titreSerie,
}: Props): ReactElement {
  const graphique = useRef<ChartJS<'bar', ReadonlyArray<number>>>(null)

  // Les couleurs DSFR sont lues sur le canvas au dessin : on redessine quand le thème clair ou sombre change.
  useEffect(() => {
    const observateur = new MutationObserver(() => {
      graphique.current?.update()
    })
    observateur.observe(document.documentElement, { attributeFilter: ['data-fr-theme'] })
    return (): void => {
      observateur.disconnect()
    }
  }, [])

  return (
    <>
      {header}
      <ReactBar
        aria-label={nomAccessible}
        data={{
          datasets: [
            {
              backgroundColor: (context: ScriptableContext<'bar'>) =>
                resoudreCouleur(context.chart.canvas, backgroundColor[context.dataIndex]),
              borderRadius: 5,
              data,
              label: titreSerie,
            },
            ...(serieEmpilee === undefined
              ? []
              : [
                  {
                    backgroundColor: serieEmpilee.backgroundColor,
                    borderRadius: 5,
                    data: serieEmpilee.data,
                    label: serieEmpilee.label,
                  },
                ]),
          ],
          labels: labels as Array<Array<string> | string>,
        }}
        options={{
          layout: { padding: { top: etiquettesValeurs === undefined ? 0 : 24 } },
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
              stacked: serieEmpilee !== undefined,
              ticks: {
                autoSkip: etiquettesValeurs === undefined,
                color:
                  etiquettesValeurs === undefined
                    ? undefined
                    : (context): string => getComputedStyle(context.chart.canvas).color,
                font: {
                  size: etiquettesValeurs === undefined ? 14 : 12,
                },
                maxRotation: etiquettesValeurs === undefined ? 50 : 0,
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
              stacked: serieEmpilee !== undefined,
              ticks: {
                display: false,
              },
            },
          },
        }}
        plugins={etiquettesValeurs === undefined ? [] : [pluginEtiquettesValeurs(etiquettesValeurs)]}
        ref={graphique}
      />
    </>
  )
}

// Valeur écrite au-dessus de chaque barre, dans la couleur de texte du thème DSFR courant.
// Dans une colonne étroite, la taille diminue (jusqu'à 8 px) pour que deux valeurs voisines ne se touchent pas.
function pluginEtiquettesValeurs(etiquettes: ReadonlyArray<string>): Plugin<'bar'> {
  return {
    afterDatasetsDraw(chart) {
      const { ctx } = chart
      const barres = chart.getDatasetMeta(0).data
      const couleurTexte = getComputedStyle(chart.canvas).color
      ctx.save()
      const abscisses = barres.map((barre) => barre.x)
      ctx.font = policeDesValeurs(TAILLE_MAX_VALEURS)
      ctx.font = policeDesValeurs(tailleDesValeurs(ctx, etiquettes, abscisses))
      ctx.fillStyle = couleurTexte
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      barres.forEach((barre, index) => {
        ctx.fillText(etiquettes[index] ?? '', barre.x, barre.y - 4)
      })
      ctx.restore()
    },
    id: 'etiquettesValeurs',
  }
}

const TAILLE_MAX_VALEURS = 12
const TAILLE_MIN_VALEURS = 8
const ESPACE_ENTRE_VALEURS = 4

function policeDesValeurs(taille: number): string {
  return `bold ${taille}px Marianne, arial, sans-serif`
}

// La largeur d'un texte est proportionnelle à sa taille : on la mesure à la taille maximale, puis on réduit.
function tailleDesValeurs(
  ctx: CanvasRenderingContext2D,
  etiquettes: ReadonlyArray<string>,
  abscisses: ReadonlyArray<number>
): number {
  if (abscisses.length < 2) {
    return TAILLE_MAX_VALEURS
  }
  const espacement = Math.min(...abscisses.slice(1).map((abscisse, index) => abscisse - abscisses[index]))
  const largeurMax = Math.max(...etiquettes.map((etiquette) => ctx.measureText(etiquette).width))
  if (largeurMax <= 0) {
    return TAILLE_MAX_VALEURS
  }
  const taille = Math.floor((TAILLE_MAX_VALEURS * (espacement - ESPACE_ENTRE_VALEURS)) / largeurMax)
  return Math.min(TAILLE_MAX_VALEURS, Math.max(TAILLE_MIN_VALEURS, taille))
}

// Une couleur « var(--token-dsfr) » est lue sur le canvas, pour suivre le thème clair ou sombre.
function resoudreCouleur(canvas: HTMLCanvasElement, couleur: string | undefined): string {
  const variable = /^var\((--[\w-]+)\)$/.exec(couleur ?? '')
  if (variable === null) {
    return couleur ?? ''
  }
  return getComputedStyle(canvas).getPropertyValue(variable[1]).trim()
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  etiquettesValeurs?: ReadonlyArray<string>
  header?: ReactNode
  labels: ReadonlyArray<ReadonlyArray<string> | string>
  nomAccessible?: string
  serieEmpilee?: Readonly<{
    backgroundColor: ReadonlyArray<string>
    data: ReadonlyArray<number>
    label: string
  }>
  titreSerie?: string
}>
