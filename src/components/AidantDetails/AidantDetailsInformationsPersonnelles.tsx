'use client'

import { ReactElement, useId, useRef, useState } from 'react'

import { InformationsPersonnellesData } from './AidantDetails'
import ModifierInformationsPersonnellesAidant from './ModifierInformationsPersonnellesAidant'
import Drawer from '../shared/Drawer/Drawer'

export default function InformationsPersonnellesCard({ data }: Readonly<InfosPersoProps>): ReactElement {
  const { aidantId, emails, nom, peutModifier, prenom, telephone } = data
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerKey, setDrawerKey] = useState(0)
  const drawerRef = useRef<HTMLDialogElement>(null)
  const drawerId = 'drawer-modifier-informations-personnelles'
  const drawerLabelId = useId()

  function openDrawer(): void {
    setDrawerKey((prev) => prev + 1)
    setIsDrawerOpen(true)
  }

  function closeDrawer(): void {
    setIsDrawerOpen(false)
    window.dsfr(drawerRef.current).modal.conceal()
  }

  return (
    <>
      <section aria-labelledby="infos-title" className="fr-mb-4w grey-border border-radius fr-p-4w">
        <div>
          {/* En-tête : titre + action Modifier */}
          <div className="fr-grid-row fr-grid-row--middle fr-grid-row--gutters">
            <div className="fr-col">
              <h2 className="fr-h3 fr-mb-0" id="infos-title">
                Informations personnelles
              </h2>
            </div>
            {peutModifier ? (
              <div className="fr-col-auto">
                <button
                  aria-controls={drawerId}
                  className="fr-link fr-link--icon-right fr-icon-pencil-line"
                  data-fr-opened="false"
                  onClick={openDrawer}
                  type="button"
                >
                  Modifier
                </button>
              </div>
            ) : null}
          </div>

          <hr className="fr-hr fr-my-2w" />

          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6">
              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">Nom</p>
              <p className="fr-text--bold fr-mb-3w">{nom}</p>

              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">Téléphone professionnel</p>
              <p className="fr-text--bold fr-mb-0">{telephone ?? '—'}</p>
            </div>

            <div className="fr-col-12 fr-col-md-6">
              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">Prénom</p>
              <p className="fr-text--bold fr-mb-3w">{prenom}</p>

              <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                {emails.length > 1 ? 'Adresses électroniques' : 'Adresse électronique'}
              </p>
              {emails.length > 0 ? (
                <div className="fr-text--bold fr-mb-0">
                  {emails.map((email, index) => (
                    <p className="fr-mb-0" key={`${email}-${index}`}>
                      {email}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="fr-text--bold fr-mb-0">—</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {peutModifier ? (
        <Drawer
          boutonFermeture="Fermer"
          closeDrawer={closeDrawer}
          id={drawerId}
          isFixedWidth={false}
          isOpen={isDrawerOpen}
          labelId={drawerLabelId}
          ref={drawerRef}
        >
          <ModifierInformationsPersonnellesAidant
            aidantId={aidantId}
            closeDrawer={closeDrawer}
            emails={emails}
            key={drawerKey}
            labelId={drawerLabelId}
            nom={nom}
            prenom={prenom}
            telephone={telephone}
          />
        </Drawer>
      ) : null}
    </>
  )
}

type InfosPersoProps = {
  readonly data: InformationsPersonnellesData
}
