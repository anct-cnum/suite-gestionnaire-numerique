'use client'

import { ReactElement } from 'react'

import { BaseActionForm } from './BaseActionForm'
import { ActionViewModel } from '@/presenters/actionPresenter'

export default function VisualiserUneAction({ action, date }: Props): ReactElement {
  return (
    <BaseActionForm
      action={action}
      date={date}
      formLabel="Visualiser une action"
      title={`Visualiser l'action ${action.nom}`}
    />
  )
}

type Props = Readonly<{
  action: ActionViewModel
  date: Date
}>
