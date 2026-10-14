'use client'

import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { useServerInsertedHTML } from 'next/navigation'
import { PropsWithChildren, ReactElement, useState } from 'react'

// react-select injecte ses styles via emotion, qui les rend inline au SSR et provoque une erreur
// d'hydratation (react-select#5459) : on les collecte pour les injecter dans le <head>.
export default function EmotionRegistry({ children }: Readonly<PropsWithChildren>): ReactElement {
  const [registre] = useState(creerRegistre)

  useServerInsertedHTML(() => {
    const noms = registre.extraireNouveauxStyles()
    if (noms.length === 0) {
      return null
    }
    return (
      <style
        dangerouslySetInnerHTML={{ __html: noms.map((nom) => registre.cache.inserted[nom]).join('') }}
        data-emotion={`${registre.cache.key} ${noms.join(' ')}`}
      />
    )
  })

  return <CacheProvider value={registre.cache}>{children}</CacheProvider>
}

function creerRegistre(): Registre {
  const cache = createCache({ key: 'css' })
  cache.compat = true
  const insererOriginal = cache.insert
  let nomsInseres: Array<string> = []
  cache.insert = (...args) => {
    const [, serialized] = args
    if (cache.inserted[serialized.name] === undefined) {
      nomsInseres.push(serialized.name)
    }
    return insererOriginal(...args)
  }
  return {
    cache,
    extraireNouveauxStyles(): ReadonlyArray<string> {
      const noms = nomsInseres
      nomsInseres = []
      return noms
    },
  }
}

type Registre = Readonly<{
  cache: ReturnType<typeof createCache>
  extraireNouveauxStyles(): ReadonlyArray<string>
}>
