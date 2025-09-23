'use client'

import { ReactElement, Suspense, use } from 'react'

export default function AccompagnementsTableCell({
  accompagnementsPromise,
  aidantId,
}: {
  readonly accompagnementsPromise: Promise<Map<string, number>>
  readonly aidantId: string
}): ReactElement {
  return (
    <Suspense fallback={
      <span className="fr-text--xs">
        ...
      </span>
    }
    >
      <AccompagnementsValue
        accompagnementsPromise={accompagnementsPromise}
        aidantId={aidantId}
      />
    </Suspense>
  )
}

function AccompagnementsValue({
  accompagnementsPromise,
  aidantId,
}: {
  readonly accompagnementsPromise: Promise<Map<string, number>>
  readonly aidantId: string
}): ReactElement {
  const accompagnementsMap = use(accompagnementsPromise)
  const nbAccompagnements = accompagnementsMap.get(aidantId) ?? 0

  return (
    <span>
      {nbAccompagnements}
    </span>
  )
}