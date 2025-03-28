// Stryker disable all
'use client'

import { createContext, PropsWithChildren, ReactElement, useMemo } from 'react'

import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function GouvernanceProvider({
  children,
  gouvernanceViewModel,
}: Props): ReactElement {
  const gouvernanceContextProviderValue = useMemo(
    () => ({
      gouvernanceViewModel,
    }),
    [gouvernanceViewModel]
  )

  return (
    <gouvernanceContext.Provider value={gouvernanceContextProviderValue}>
      {children}
    </gouvernanceContext.Provider>
  )
}

export const gouvernanceContext = createContext<GouvernanceContextProviderValue>({} as GouvernanceContextProviderValue)

 type GouvernanceContextProviderValue = Readonly<{
   gouvernanceViewModel: GouvernanceViewModel
 }>

type Props = PropsWithChildren<Readonly<{
  gouvernanceViewModel: GouvernanceViewModel
}>>
