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
import ResumeMembre from './Membre/ResumeMembre'
import AjouterNoteDeContexte from './NoteDeContexte/AjouterNoteDeContexte'
import ModifierNoteDeContexte from './NoteDeContexte/ModifierNoteDeContexte'
import NoteDeContexteVide from './NoteDeContexte/NoteDeContexteVide'
import SubSectionButton from './NoteDeContexte/SubSectionButton'
import SectionNotePrivee from './NotePrivee/SectionNotePrivee'
import Resume from './Resume'
import SectionRemplie from './SectionRemplie'
import SectionVide from './SectionVide'
import SubSectionTitle from './SubSectionTitle'
import Drawer from '../shared/Drawer/Drawer'
import { gouvernanceContext } from '../shared/GouvernanceContext'
import PageTitle from '../shared/PageTitle/PageTitle'
import ReadMore from '../shared/ReadMore/ReadMore'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

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
      <PageTitle>
        <TitleIcon icon="compass-3-line" />
        Inclusion numérique ·
        {' '}
        {gouvernanceViewModel.departement}
      </PageTitle>
    
      <p>
        Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.
      </p>
      <div className="fr-grid-row fr-grid-row--gutters fr-mb-1w">
        <ResumeMembre
          denomination={gouvernanceViewModel.sectionMembres.totalEtWording[1]}
          membresLink={gouvernanceViewModel.links.membres}
          peutVoirNotePrivee={gouvernanceViewModel.peutVoirNotePrivee}
          total={gouvernanceViewModel.sectionMembres.totalEtWording[0]}
        />
        {
          gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute.length > 0 ?
            <ResumeFeuilleDeRoute
              link={gouvernanceViewModel.sectionFeuillesDeRoute.lien.url}
              linkLabel={gouvernanceViewModel.sectionFeuillesDeRoute.lien.label}
              peutVoirNotePrivee={gouvernanceViewModel.peutVoirNotePrivee}
              total={gouvernanceViewModel.sectionFeuillesDeRoute.total}
              wording={gouvernanceViewModel.sectionFeuillesDeRoute.wording}
            /> : (
              <Resume
                peutVoirNotePrivee={gouvernanceViewModel.peutVoirNotePrivee}
                style={styles['resume-feuilles-de-route']}
              >
                <ResumeFeuilleDeRouteVide />
              </Resume>
            )
        }
        <SectionNotePrivee
          drawerNotePriveeId={drawerNotePriveeId}
          gouvernanceViewModel={gouvernanceViewModel}
          isDrawerOpen={isDrawerOpen}
          labelNotePriveeId={labelNotePriveeId}
          setIsDrawerOpen={setIsDrawerOpen}
        />
      </div>
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
            peutGerer={gouvernanceViewModel.peutGererGouvernance}
            uidGouvernance={gouvernanceViewModel.uid}
          />
        </Drawer>
        {
          gouvernanceViewModel.comites ? (
            <SectionRemplie
              button={gouvernanceViewModel.peutGererGouvernance ? (
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
              ) : undefined}
              id="comitologie"
              title="Comitologie"
            >
              <ComitologieRemplie
                comites={gouvernanceViewModel.comites}
                dateAujourdhui={gouvernanceViewModel.dateAujourdhui}
                peutGerer={gouvernanceViewModel.peutGererGouvernance}
                uidGouvernance={gouvernanceViewModel.uid}
              />
            </SectionRemplie>
          ) : (
            <SectionVide
              id="comitologie"
              title="Comitologie"
            >
              <ComitologieVide
                drawerComiteId={drawerComiteId}
                peutAjouter={gouvernanceViewModel.peutGererGouvernance}
                showDrawer={() => {
                  setIsDrawerOpen(true)
                }}
              />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="membre">
        <SectionRemplie
          button={(
            <Link
              className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
              href={`/gouvernance/${gouvernanceViewModel.uid}/membres`}
            >
              {gouvernanceViewModel.peutGererGouvernance ? 'Gérer' : 'Voir'}
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
          {
            gouvernanceViewModel.sectionMembres.coporteurs.length > 0 ? (
              <MembreRempli
                coporteurs={gouvernanceViewModel.sectionMembres.coporteurs}
              />
            ) : 
              null
            
          }
        </SectionRemplie>
      </section>
      <section aria-labelledby="feuilleDeRoute">
        {
          gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute.length > 0 ? (
            <SectionRemplie
              button={(
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                  href={`/gouvernance/${gouvernanceViewModel.uid}/feuilles-de-route`}
                >
                  {gouvernanceViewModel.peutGererGouvernance ? 'Gérer' : 'Voir'}
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
              id="feuilleDeRoute"
              title="0 feuille de route"
            >
              <FeuilleDeRouteVide lien={`/gouvernance/${gouvernanceViewModel.uid}/feuilles-de-route`} />
            </SectionVide>
          )
        }
      </section>
      <section aria-labelledby="noteDeContexte">
        {
          gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
            <>
              <SectionRemplie
                button={gouvernanceViewModel.peutGererGouvernance ? (
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
                ) : undefined}
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
                  peutGerer={gouvernanceViewModel.peutGererGouvernance}
                  sousTitre={gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
                  texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteAvecHTML}
                  uidGouvernance={gouvernanceViewModel.uid}
                />
              </Drawer>
            </>
          ) : (
            <>
              <SectionVide
                id="noteDeContexte"
                title="Note de contexte"
              >
                <NoteDeContexteVide
                  drawerNoteDeContexteId={drawerNoteDeContexteId}
                  peutAjouter={gouvernanceViewModel.peutGererGouvernance}
                  showDrawer={() => {
                    setIsDrawerOpen(true)
                  }}
                />
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
                  peutGerer={gouvernanceViewModel.peutGererGouvernance}
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
