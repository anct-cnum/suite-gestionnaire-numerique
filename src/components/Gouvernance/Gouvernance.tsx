'use client'

import Link from 'next/link'
import { ReactElement, useId, useRef, useState } from 'react'

import AjouterUnComite from './Comitologie/AjouterUnComite'
import ComitologieRemplie from './Comitologie/ComitologieRemplie'
import ComitologieVide from './Comitologie/ComitologieVide'
import FeuilleDeRouteRemplie from './FeuilleDeRoute/FeuilleDeRouteRemplie'
import FeuilleDeRouteVide from './FeuilleDeRoute/FeuilleDeRouteVide'
import ResumeFeuilleDeRoute from './FeuilleDeRoute/ResumeFeuilleDeRoute'
import ResumeFeuilleDeRouteVide from './FeuilleDeRoute/ResumeFeuilleDeRouteVide'
import styles from './Gouvernance.module.css'
import MembreRempli from './Membre/MembreRempli'
import MembreVide from './Membre/MembreVide'
import ResumeMembre from './Membre/ResumeMembre'
import ResumeMembreVide from './Membre/ResumeMembreVide'
import AjouterNoteDeContexte from './NoteDeContexte/AjouterNoteDeContexte'
import ModifierNoteDeContexte from './NoteDeContexte/ModifierNoteDeContexte'
import NoteDeContexteRemplie from './NoteDeContexte/NoteDeContexteRemplie'
import NoteDeContexteVide from './NoteDeContexte/NoteDeContexteVide'
import SubSectionButton from './NoteDeContexte/SubSectionButton'
import AjouterUneNotePrivee from './NotePrivee/AjouterUneNotePrivee'
import ModifierUneNotePrivee from './NotePrivee/ModifierUneNotePrivee'
import ResumeNotePrivee from './NotePrivee/ResumeNotePrivee'
import ResumeNotePriveeVide from './NotePrivee/ResumeNotePriveeVide'
import Resume from './Resume'
import SectionRemplie from './SectionRemplie'
import SectionVide from './SectionVide'
import SubSectionTitle from './SubSectionTitle'
import Drawer from '../shared/Drawer/Drawer'
import PageTitle from '../shared/PageTitle/PageTitle'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function Gouvernance({ gouvernanceViewModel }: Props): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerComiteId = 'drawerAjouterComiteId'
  const labelComiteId = useId()
  const drawerNoteDeContexteId = 'drawerAjouterNoteDeContexteId'
  const labelNoteDeContexteId = useId()
  const labelModifierNoteDeContexteId = useId()
  const drawerModifierNoteDeContexteId = 'drawerModifierNoteDeContexteId'
  const drawerNotePriveeId = 'drawerAjouterNotePriveeId'
  const labelNotePriveeId = useId()
  const drawerRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <title>
        {`Gouvernance ${gouvernanceViewModel.departement}`}
      </title>
      <PageTitle icon="compass-3-line">
        Inclusion numérique ·
        {' '}
        {gouvernanceViewModel.departement}
      </PageTitle>
      <p>
        Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.
      </p>
      {
        gouvernanceViewModel.isVide ?
          null :
          (
            <div className="fr-grid-row fr-grid-row--gutters fr-mb-1w">
              {
                gouvernanceViewModel.sectionCoporteurs.coporteurs ?
                  <ResumeMembre
                    total={gouvernanceViewModel.sectionCoporteurs.total}
                    type={gouvernanceViewModel.sectionCoporteurs.wording}
                  /> : (
                    <Resume style={styles['resume-membres']}>
                      <ResumeMembreVide />
                    </Resume>
                  )
              }
              {
                gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute ?
                  <ResumeFeuilleDeRoute
                    link={gouvernanceViewModel.sectionFeuillesDeRoute.lien.url}
                    linkLabel={gouvernanceViewModel.sectionFeuillesDeRoute.lien.label}
                    total={gouvernanceViewModel.sectionFeuillesDeRoute.total}
                    wording={gouvernanceViewModel.sectionFeuillesDeRoute.wording}
                  /> : (
                    <Resume style={styles['resume-feuilles-de-route']}>
                      <ResumeFeuilleDeRouteVide />
                    </Resume>
                  )
              }
              {
                gouvernanceViewModel.notePrivee ? (
                  <>
                    <Drawer
                      boutonFermeture="Fermer le formulaire de modification d’une note privée"
                      closeDrawer={() => {
                        setIsDrawerOpen(false)
                      }}
                      id={drawerNotePriveeId}
                      // Stryker disable next-line BooleanLiteral
                      isFixedWidth={false}
                      isOpen={isDrawerOpen}
                      labelId={labelNotePriveeId}
                      ref={drawerRef}
                    >
                      <ModifierUneNotePrivee
                        closeDrawer={() => {
                          setIsDrawerOpen(false)
                        }}
                        edition={gouvernanceViewModel.notePrivee.edition}
                        id={drawerNotePriveeId}
                        labelId={labelNotePriveeId}
                        texte={gouvernanceViewModel.notePrivee.texte}
                        uidGouvernance={gouvernanceViewModel.uid}
                      />
                    </Drawer>
                    <Resume style={styles['resume-note-privee']}>
                      <ResumeNotePrivee
                        edition={gouvernanceViewModel.notePrivee.edition}
                        id={drawerNotePriveeId}
                        showDrawer={() => {
                          setIsDrawerOpen(true)
                        }}
                        texte={gouvernanceViewModel.notePrivee.resume}
                      />
                    </Resume>
                  </>
                ) : (
                  <>
                    <Drawer
                      boutonFermeture="Fermer le formulaire de création d’une note privée"
                      closeDrawer={() => {
                        setIsDrawerOpen(false)
                      }}
                      id={drawerNotePriveeId}
                      // Stryker disable next-line BooleanLiteral
                      isFixedWidth={false}
                      isOpen={isDrawerOpen}
                      labelId={labelNotePriveeId}
                      ref={drawerRef}
                    >
                      <AjouterUneNotePrivee
                        closeDrawer={() => {
                          setIsDrawerOpen(false)
                        }}
                        id={drawerNotePriveeId}
                        labelId={labelNotePriveeId}
                        uidGouvernance={gouvernanceViewModel.uid}
                      />
                    </Drawer>
                    <Resume style={styles['resume-note-privee-vide']}>
                      <ResumeNotePriveeVide
                        id={drawerNotePriveeId}
                        showDrawer={() => {
                          setIsDrawerOpen(true)
                        }}
                      />
                    </Resume>
                  </>
                )
              }
            </div>
          )
      }
      <section aria-labelledby="comitologie">
        <Drawer
          boutonFermeture="Fermer le formulaire de création d’un comité"
          closeDrawer={() => {
            setIsDrawerOpen(false)
          }}
          id={drawerComiteId}
          // Stryker disable next-line BooleanLiteral
          isFixedWidth={false}
          isOpen={isDrawerOpen}
          labelId={labelComiteId}
          ref={drawerRef}
        >
          <AjouterUnComite
            closeDrawer={() => {
              setIsDrawerOpen(false)
            }}
            comite={gouvernanceViewModel.comiteARemplir}
            dateAujourdhui={gouvernanceViewModel.dateAujourdhui}
            id={drawerComiteId}
            labelId={labelComiteId}
            uidGouvernance={gouvernanceViewModel.uid}
          />
        </Drawer>
        {
          gouvernanceViewModel.comites ? (
            <SectionRemplie
              button={(
                <button
                  aria-controls={drawerComiteId}
                  className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-add-line"
                  data-fr-opened="false"
                  onClick={() => {
                    setIsDrawerOpen(true)
                  }}
                  type="button"
                >
                  Ajouter
                </button>
              )}
              id="comitologie"
              title="Comitologie"
            >
              <ComitologieRemplie
                comites={gouvernanceViewModel.comites}
                dateAujourdhui={gouvernanceViewModel.dateAujourdhui}
                uidGouvernance={gouvernanceViewModel.uid}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              buttonLabel="Ajouter un comité"
              drawerComiteId={drawerComiteId}
              id="comitologie"
              showDrawer={() => {
                setIsDrawerOpen(true)
              }}
              title="Comitologie"
            >
              <ComitologieVide />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="membre">
        {
          gouvernanceViewModel.sectionCoporteurs.coporteurs ? (
            <SectionRemplie
              button={(
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                  href="/"
                >
                  Gérer
                </Link>
              )}
              id="membre"
              subTitle={
                <SubSectionTitle>
                  {gouvernanceViewModel.sectionCoporteurs.detailDuNombreDeChaqueMembre}
                </SubSectionTitle>
              }
              title={`${gouvernanceViewModel.sectionCoporteurs.total} ${gouvernanceViewModel.sectionCoporteurs.wording}`}
            >
              <MembreRempli
                coporteurs={gouvernanceViewModel.sectionCoporteurs.coporteurs}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              buttonLabel="Ajouter un membre"
              drawerComiteId=""
              id="membre"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              showDrawer={() => { }}
              title="0 membre"
            >
              <MembreVide />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="feuilleDeRoute">
        {
          gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute ? (
            <SectionRemplie
              button={(
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                  href="/"
                >
                  Gérer
                </Link>
              )}
              id="feuilleDeRoute"
              subTitle={
                <SubSectionTitle>
                  {`${gouvernanceViewModel.sectionFeuillesDeRoute.total} ${gouvernanceViewModel.sectionFeuillesDeRoute.wording}, ${gouvernanceViewModel.sectionFeuillesDeRoute.budgetTotalCumule} €`}
                </SubSectionTitle>
              }
              title={`${gouvernanceViewModel.sectionFeuillesDeRoute.total} ${gouvernanceViewModel.sectionFeuillesDeRoute.wording}`}
            >
              <FeuilleDeRouteRemplie
                feuillesDeRoute={gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              buttonLabel="Ajouter une feuille de route"
              drawerComiteId=""
              id="feuilleDeRoute"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              showDrawer={() => { }}
              title="0 feuille de route"
            >
              <FeuilleDeRouteVide />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="noteDeContexte">
        {
          gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
            <>
              <SectionRemplie
                button={(
                  <button
                    aria-controls={drawerModifierNoteDeContexteId}
                    className="fr-btn fr-btn--secondary"
                    data-fr-opened="false"
                    onClick={() => {
                      setIsDrawerOpen(true)
                    }}
                    type="button"
                  >
                    Modifier
                  </button>
                )}
                id="noteDeContexte"
                subButton={(
                  <SubSectionButton>
                    {gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
                  </SubSectionButton>
                )}
                title="Note de contexte"
              >
                <NoteDeContexteRemplie
                  texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteAvecHTML}
                />
              </SectionRemplie>
              <Drawer
                boutonFermeture="Fermer le formulaire de modification d’une note de contexte"
                closeDrawer={() => {
                  setIsDrawerOpen(false)
                }}
                id={drawerModifierNoteDeContexteId}
                // Stryker disable next-line BooleanLiteral
                isFixedWidth={false}
                isOpen={isDrawerOpen}
                labelId={labelModifierNoteDeContexteId}
              >
                <ModifierNoteDeContexte
                  closeDrawer={() => {
                    setIsDrawerOpen(false)
                  }}
                  id={drawerModifierNoteDeContexteId}
                  label="Note de contexte"
                  labelId={labelModifierNoteDeContexteId}
                  sousTitre={gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
                  texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteAvecHTML}
                  uidGouvernance={gouvernanceViewModel.uid}
                />
              </Drawer>
            </>
          ) : (
            <>
              <SectionVide
                buttonLabel="Ajouter une note de contexte"
                drawerComiteId={drawerNoteDeContexteId}
                id="noteDeContexte"
                showDrawer={() => {
                  setIsDrawerOpen(true)
                }}
                title="Note de contexte"
              >
                <NoteDeContexteVide />
              </SectionVide>

              <Drawer
                boutonFermeture="Fermer le formulaire de création d’une note de contexte"
                closeDrawer={() => {
                  setIsDrawerOpen(false)
                }}
                id={drawerNoteDeContexteId}
                // Stryker disable next-line BooleanLiteral
                isFixedWidth={false}
                isOpen={isDrawerOpen}
                labelId={labelNoteDeContexteId}
                ref={drawerRef}
              >
                <AjouterNoteDeContexte
                  closeDrawer={() => {
                    setIsDrawerOpen(false)
                  }}
                  id={drawerNoteDeContexteId}
                  labelId={labelNoteDeContexteId}
                  uidGouvernance={gouvernanceViewModel.uid}
                />
              </Drawer>
            </>
          )
        }
      </section>
    </>
  )
}

type Props = Readonly<{
  gouvernanceViewModel: GouvernanceViewModel
}>
