'use client'

import Script from 'next/script'
import { ReactElement, useEffect, useState } from 'react'

// Le JS du DSFR annote le DOM dès son démarrage (attributs data-fr-js-*) : s'il s'exécute avant la fin de
// l'hydratation, React signale un écart entre le HTML serveur et le rendu client (cf. #1915). Le script n'est
// donc injecté qu'une fois ce composant monté, c'est-à-dire après l'hydratation de la frontière Suspense qui
// le contient.
//
// Règle de placement : ce composant doit être rendu APRÈS {children} dans le layout le plus profond de chaque
// groupe de routes, et À L'INTÉRIEUR du <Suspense> qui enveloppe {children} s'il y en a un. Un segment (page)
// s'hydrate en effet dans la frontière Suspense qui l'entoure, après le reste de l'arbre : rendu hors de cette
// frontière (dans le layout racine par exemple), ce composant serait monté avant l'hydratation de la page.
export default function Dsfr(): null | ReactElement {
  const [estMonte, setEstMonte] = useState(false)

  useEffect(() => {
    setEstMonte(true)
  }, [])

  return estMonte ? <Script src="/dsfr/dsfr.module.min.js" strategy="lazyOnload" /> : null
}
