import { FormEvent, ReactElement, useContext, useState } from 'react'

import FormulaireNotePrivee from './FormulaireNotePrivee'
import styles from '../Gouvernance.module.css'
import { clientContext } from '@/components/shared/ClientContext'
import { Notification } from '@/components/shared/Notification/Notification'
import SubmitButton from '@/components/shared/SubmitButton/SubmitButton'

export default function ModifierUneNotePrivee({
  edition,
  id,
  labelId,
  texte,
  uidGouvernance,
  closeDrawer,
}: Props): ReactElement {
  const { modifierUneNotePriveeAction, pathname, supprimerUneNotePriveeAction } = useContext(clientContext)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <FormulaireNotePrivee
      labelId={labelId}
      texte={texte}
      validerFormulaire={modifierLaNotePrivee}
    >
      <div className="fr-btns-group">
        <SubmitButton
          ariaControls={id}
          isDisabled={isDisabled}
        >
          {isDisabled ? 'Modification en cours...' : 'Enregistrer'}
        </SubmitButton>
        <button
          className="fr-btn red-button"
          onClick={viderLeContenu}
          type="reset"
        >
          Effacer
        </button>
      </div>
      <p className={`fr-text--xs ${styles.center}`}>
        {edition}
      </p>
    </FormulaireNotePrivee>
  )

  async function modifierLaNotePrivee(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsDisabled(true)

    const form = new FormData(event.currentTarget)
    const [contenu] = form.values() as FormDataIterator<string>

    if (contenu === '') {
      const messages = await supprimerUneNotePriveeAction({
        path: pathname,
        uidGouvernance,
      })
      if (messages.includes('OK')) {
        Notification('success', { description: 'supprimée', title: 'Note privée ' })
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
    } else {
      const messages = await modifierUneNotePriveeAction({
        contenu,
        path: pathname,
        uidGouvernance,
      })
      if (messages.includes('OK')) {
        Notification('success', { description: 'modifiée', title: 'Note privée ' })
      } else {
        Notification('error', { description: (messages as ReadonlyArray<string>).join(', '), title: 'Erreur : ' })
      }
    }

    closeDrawer()
    setIsDisabled(false)
  }

  function viderLeContenu(event: FormEvent<HTMLButtonElement>): void {
    event.preventDefault()
    // @ts-expect-error
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    event.target.form.querySelector('textarea').value = ''
  }
}

type Props = Readonly<{
  edition: string
  id: string
  labelId: string
  texte: string
  uidGouvernance: string
  closeDrawer(): void
}>
