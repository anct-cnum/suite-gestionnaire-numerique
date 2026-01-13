'use client'

import { ReactElement, useId, useState } from 'react'

import ModifierContactReferentStructure from './ModifierContactReferentStructure'
import Drawer from '../shared/Drawer/Drawer'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureContactReferent({ contactReferent, structureId }: Props): ReactElement {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerId = 'drawer-modifier-contact-referent'
  const drawerLabelId = useId()

  function closeDrawer(): void {
    setIsDrawerOpen(false)
  }

  return (
    <>
      <section
        aria-labelledby="contact"
        className="grey-border border-radius fr-mb-2w fr-p-4w"
      >
        <header className="fr-grid-row space-between separator fr-mb-6w">
          <h2
            className="fr-h6"
            id="contact"
          >
            Contact référent
          </h2>
          <div className="fr-col-auto">
            <button
              aria-controls={drawerId}
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
              data-fr-opened="false"
              onClick={() => {
                setIsDrawerOpen(true)
              }}
              type="button"
            >
              Modifier
            </button>
          </div>
        </header>
        <article
          aria-label="Contact référent"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'flex', gap: '24px' }}>
            <dl
              role="list"
              style={{ flex: '1 0 0', margin: 0 }}
            >
              <dt className="color-grey">
                Nom
              </dt>
              <dd className="font-weight-500">
                {contactReferent.nom}
              </dd>
            </dl>
            <dl
              role="list"
              style={{ flex: '1 0 0', margin: 0 }}
            >
              <dt className="color-grey">
                Prénom
              </dt>
              <dd className="font-weight-500">
                {contactReferent.prenom}
              </dd>
            </dl>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <dl
              role="list"
              style={{ flex: '1 0 0', margin: 0 }}
            >
              <dt className="color-grey">
                Téléphone professionnel
              </dt>
              <dd className="font-weight-500">
                {contactReferent.telephone}
              </dd>
            </dl>
            <dl
              role="list"
              style={{ flex: '1 0 0', margin: 0 }}
            >
              <dt className="color-grey">
                Adresse électronique
              </dt>
              <dd className="font-weight-500">
                {contactReferent.email}
              </dd>
            </dl>
          </div>

          <dl
            role="list"
            style={{ margin: 0 }}
          >
            <dt className="color-grey">
              Fonction
            </dt>
            <dd className="font-weight-500">
              {contactReferent.fonction}
            </dd>
          </dl>
        </article>
      </section>

      <Drawer
        boutonFermeture="Fermer"
        closeDrawer={closeDrawer}
        id={drawerId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={drawerLabelId}
      >
        <ModifierContactReferentStructure
          closeDrawer={closeDrawer}
          contactReferent={contactReferent}
          id={drawerId}
          labelId={drawerLabelId}
          structureId={structureId}
        />
      </Drawer>
    </>
  )
}

type Props = Readonly<{
  contactReferent: StructureViewModel['contactReferent']
  structureId: number
}>
