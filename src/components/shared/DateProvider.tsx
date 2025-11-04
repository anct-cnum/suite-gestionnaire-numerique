// Stryker disable all
'use client'

import { createContext, PropsWithChildren, ReactElement, useContext, useMemo } from 'react'

type DateService = Readonly<{
  now(): Date
}>

const defaultDateService: DateService = {
  // eslint-disable-next-line no-restricted-syntax
  now: () => new Date(),
}

const dateContext = createContext<DateService>(defaultDateService)

export function useDateService(): DateService {
  return useContext(dateContext)
}

export default function DateProvider({ children, dateService = defaultDateService }: Props): ReactElement {
  const value = useMemo(() => dateService, [dateService])

  return (
    <dateContext.Provider value={value}>
      {children}
    </dateContext.Provider>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    dateService?: DateService
  }>
>
