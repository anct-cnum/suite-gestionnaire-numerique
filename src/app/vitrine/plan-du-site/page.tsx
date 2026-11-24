import { Metadata } from 'next'
import { ReactElement } from 'react'

import PlanDuSite from '@/components/vitrine/PlanDuSite/PlanDuSite'

export const metadata: Metadata = {
  description: 'Plan du site Inclusion Numérique : toutes les rubriques et les pages du site.',
  title: 'Plan du site - Inclusion Numérique',
}

export default function PlanDuSiteController(): ReactElement {
  return <PlanDuSite />
}
