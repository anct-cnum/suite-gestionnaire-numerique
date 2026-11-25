import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AccompagnementBarChart } from './AccompagnementBarChart'

describe('histogramme des accompagnements', () => {
  it('dans un bloc étroit, les dates sous les barres ne se chevauchent pas et la dernière reste visible (#2382)', async () => {
    // GIVEN
    const douzeMois = Array.from({ length: 12 }, (_, index) => ({
      count: 100 + index,
      label: `${String(((index + 11) % 12) + 1).padStart(2, '0')}/${index === 0 ? 25 : 26}`,
    }))

    // WHEN
    const dates = await afficherLHistogramme(douzeMois, 320)

    // THEN
    expect(dates.length).toBeGreaterThan(1)
    expect(dates.length).toBeLessThan(12)
    expect(dates.at(-1)?.textContent).toBe('11/26')
    dates.slice(1).forEach((date, index) => {
      const precedente = dates[index]
      const ecart = Number(date.getAttribute('x')) - Number(precedente.getAttribute('x'))
      expect(ecart).toBeGreaterThanOrEqual(largeurDuTexte(precedente.textContent))
    })
  })

  it('quand la place suffit, toutes les dates sont affichées, en petite taille (#2382)', async () => {
    // GIVEN
    const douzeMois = Array.from({ length: 12 }, (_, index) => ({
      count: 100 + index,
      label: `${String(index + 1).padStart(2, '0')}/26`,
    }))

    // WHEN
    const dates = await afficherLHistogramme(douzeMois, 1000)

    // THEN
    expect(dates.map((date) => date.textContent)).toStrictEqual(douzeMois.map(({ label }) => label))
    dates.forEach((date) => {
      expect(date.getAttribute('font-size')).toBe('0.75rem')
    })
  })

  it('texte agrandi à 200 %, la dernière date reste entière dans le graphique (#2382)', async () => {
    // GIVEN
    const douzeMois = Array.from({ length: 12 }, (_, index) => ({
      count: 100 + index,
      label: `${String(index + 1).padStart(2, '0')}/26`,
    }))
    const largeurDUnCaractereA200 = 12

    // WHEN
    const dates = await afficherLHistogramme(douzeMois, 1000, largeurDUnCaractereA200)

    // THEN
    const derniere = dates.at(-1)
    expect(derniere?.textContent).toBe('12/26')
    const finDeLaDerniere = Number(derniere?.getAttribute('x')) + largeurDuTexte('12/26', largeurDUnCaractereA200) / 2
    expect(finDeLaDerniere).toBeLessThanOrEqual(1000)
  })
})

const LARGEUR_D_UN_CARACTERE = 7

function largeurDuTexte(texte: null | string, largeurDUnCaractere = LARGEUR_D_UN_CARACTERE): number {
  return (texte ?? '').length * largeurDUnCaractere
}

async function afficherLHistogramme(
  data: Array<{ count: number; label: string }>,
  largeur: number,
  largeurDUnCaractere = LARGEUR_D_UN_CARACTERE
): Promise<ReadonlyArray<Element>> {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn<() => void>()
      observe = vi.fn<() => void>()
      unobserve = vi.fn<() => void>()
    }
  )
  // jsdom ne calcule aucune dimension : le conteneur prend la largeur voulue, chaque texte mesuré à la largeur d'un
  // caractère donnée (7 px par défaut)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mesurer(this: HTMLElement) {
    const estUnTexteMesure = this.id === 'recharts_measurement_span'
    const width = estUnTexteMesure ? largeurDuTexte(this.textContent, largeurDUnCaractere) : largeur
    const height = estUnTexteMesure ? 12 : 176
    return { bottom: height, height, left: 0, right: width, top: 0, width, x: 0, y: 0 } as DOMRect
  })
  const { container, findAllByText } = render(
    <div style={{ height: 176, width: largeur }}>
      <AccompagnementBarChart data={data} />
    </div>
  )
  await findAllByText(data[data.length - 1].label)
  return Array.from(container.querySelectorAll('.recharts-xAxis-tick-labels .recharts-cartesian-axis-tick-value'))
}
