'use client'

import Link from 'next/link'
import { ReactElement, useContext, useId, useState } from 'react'

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
import { gouvernanceContext } from '../shared/GouvernanceContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import ReadMore from '../shared/ReadMore/ReadMore'
import { noop } from '@/shared/lang'

export default function Gouvernance(): ReactElement {
  // Stryker disable next-line BooleanLiteral
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const drawerComiteId = 'drawerAjouterComiteId'
  const labelComiteId = useId()
  const drawerNoteDeContexteId = 'drawerAjouterNoteDeContexteId'
  const labelNoteDeContexteId = useId()
  const drawerNotePriveeId = 'drawerAjouterNotePriveeId'
  const labelNotePriveeId = useId()
  const { gouvernanceViewModel } = useContext(gouvernanceContext)

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
                gouvernanceViewModel.hasMembres ?
                  <ResumeMembre
                    denomination={gouvernanceViewModel.sectionMembres.totalEtWording[1]}
                    membresLink={gouvernanceViewModel.links.membres}
                    total={gouvernanceViewModel.sectionMembres.totalEtWording[0]}
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
          gouvernanceViewModel.hasMembres ? (
            <SectionRemplie
              button={(
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                  href={`/gouvernance/${gouvernanceViewModel.uid}/membres`}
                >
                  Gérer
                </Link>
              )}
              id="membre"
              subTitle={
                <SubSectionTitle>
                  {gouvernanceViewModel.sectionMembres.wordingRecap}
                </SubSectionTitle>
              }
              title={`${gouvernanceViewModel.sectionMembres.totalEtWording[0]} ${gouvernanceViewModel.sectionMembres.totalEtWording[1]}`}
            >
              <MembreRempli
                coporteurs={gouvernanceViewModel.sectionMembres.coporteurs}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              buttonLabel="Ajouter un membre"
              drawerComiteId=""
              id="membre"
              showDrawer={noop}
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
                  href={`/gouvernance/${gouvernanceViewModel.uid}/feuilles-de-route`}
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
              showDrawer={noop}
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
                    aria-controls={drawerNoteDeContexteId}
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
                <ReadMore
                  texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteAvecHTML}
                />
              </SectionRemplie>
              <Drawer
                boutonFermeture="Fermer le formulaire de modification d’une note de contexte"
                closeDrawer={() => {
                  setIsDrawerOpen(false)
                }}
                id={drawerNoteDeContexteId}
                // Stryker disable next-line BooleanLiteral
                isFixedWidth={false}
                isOpen={isDrawerOpen}
                labelId={labelNoteDeContexteId}
              >
                <ModifierNoteDeContexte
                  closeDrawer={() => {
                    setIsDrawerOpen(false)
                  }}
                  id={drawerNoteDeContexteId}
                  label="Note de contexte"
                  labelId={labelNoteDeContexteId}
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
