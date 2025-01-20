'use client'

import Link from 'next/link'
import { ReactElement, useRef, useState } from 'react'

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
import AjouterNoteDeContext from './NoteDeContexte/AjouterNoteDeContext'
import NoteDeContexteRemplie from './NoteDeContexte/NoteDeContexteRemplie'
import NoteDeContexteVide from './NoteDeContexte/NoteDeContexteVide'
import ResumeNoteDeContexte from './NoteDeContexte/ResumeNoteDeContexte'
import ResumeNoteDeContexteVide from './NoteDeContexte/ResumeNoteDeContexteVide'
import SubSectionButton from './NoteDeContexte/SubSectionButton'
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
  const labelComiteId = 'labelAjouterComiteId'
  const drawerNoteDeContexteId = 'drawerAjouterNoteDeContexteId'
  const labelNoteDeContexteId = 'labelAjouterNoteDeContexteId'
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
                gouvernanceViewModel.sectionMembres.membres ?
                  <ResumeMembre
                    total={gouvernanceViewModel.sectionMembres.total}
                    type={gouvernanceViewModel.sectionMembres.wording}
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
                gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
                  <ResumeNoteDeContexte
                    sousTitre={gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
                    texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteSansHTML}
                  />
                ) : (
                  <Resume style={styles['resume-note-de-contexte']}>
                    <ResumeNoteDeContexteVide />
                  </Resume>
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
            comite={gouvernanceViewModel.comiteVide}
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
          gouvernanceViewModel.sectionMembres.membres ? (
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
                  {gouvernanceViewModel.sectionMembres.detailDuNombreDeChaqueMembre}
                </SubSectionTitle>
              }
              title={`${gouvernanceViewModel.sectionMembres.total} ${gouvernanceViewModel.sectionMembres.wording}`}
            >
              <MembreRempli
                membres={gouvernanceViewModel.sectionMembres.membres}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              buttonLabel="Ajouter un membre"
              drawerComiteId=""
              id="membre"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              showDrawer={() => {}}
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
              showDrawer={() => {}}
              title="0 feuille de route"
            >
              <FeuilleDeRouteVide />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="noteDeContexte">
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
          <AjouterNoteDeContext
            closeDrawer={() => {
              setIsDrawerOpen(false)
            }}
            dialogRef={drawerRef}
            labelId={labelNoteDeContexteId}
          />
        </Drawer>
        {
          gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
            <SectionRemplie
              button={(
                <button
                  aria-controls={drawerNoteDeContexteId}
                  className="fr-btn fr-btn--secondary"
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
          ) : (
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
          )
        }
      </section>
    </>
  )
}

type Props = Readonly<{
  gouvernanceViewModel: GouvernanceViewModel
}>
