import { Metadata } from 'next'
import { ReactElement } from 'react'

import DonneesPersonnelles from '@/components/DonneesPersonnelles/DonneesPersonnelles'

export const metadata: Metadata = {
  title: 'Données personnelles',
}

export default function DonneesPersonnellesController(): ReactElement {
  return <DonneesPersonnelles />
}
