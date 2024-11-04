import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

export default function AccueilController(): ReactElement {
  redirect('/tableau-de-bord')
}
