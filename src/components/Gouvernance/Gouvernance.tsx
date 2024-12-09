import { ReactElement } from 'react'

import ComitologieRemplie from './Comitologie/ComitologieRemplie'
import ComitologieVide from './Comitologie/ComitologieVide'
import FeuilleDeRouteRemplie from './FeuilleDeRoute/FeuilleDeRouteRemplie'
import FeuilleDeRouteVide from './FeuilleDeRoute/FeuilleDeRouteVide'
import ResumeFeuilleDeRoute from './FeuilleDeRoute/ResumeFeuilleDeRoute'
import ResumeFeuilleDeRouteVide from './FeuilleDeRoute/ResumeFeuilleDeRouteVide'
import MembreRempli from './Membre/MembreRempli'
import MembreVide from './Membre/MembreVide'
import ResumeMembre from './Membre/ResumeMembre'
import ResumeMembreVide from './Membre/ResumeMembreVide'
import NoteDeContexteRemplie from './NoteDeContexte/NoteDeContexteRemplie'
import NoteDeContexteVide from './NoteDeContexte/NoteDeContexteVide'
import ResumeNoteDeContexte from './NoteDeContexte/ResumeNoteDeContexte'
import ResumeNoteDeContexteVide from './NoteDeContexte/ResumeNoteDeContexteVide'
import PageTitle from '../shared/PageTitle/PageTitle'
import { GouvernanceViewModel } from '@/presenters/gouvernancePresenter'

export default function Gouvernance({ gouvernanceViewModel }: GouvernanceProps): ReactElement {
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
                  /> : <ResumeMembreVide />
              }
              {
                gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute ?
                  <ResumeFeuilleDeRoute
                    link={gouvernanceViewModel.sectionFeuillesDeRoute.lien.url}
                    linkLabel={gouvernanceViewModel.sectionFeuillesDeRoute.lien.label}
                    total={gouvernanceViewModel.sectionFeuillesDeRoute.total}
                    wording={gouvernanceViewModel.sectionFeuillesDeRoute.wording}
                  /> : <ResumeFeuilleDeRouteVide />
              }
              {
                gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
                  <ResumeNoteDeContexte
                    sousTitre={gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
                    texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteSansHTML}
                  />
                ) : <ResumeNoteDeContexteVide />
              }
            </div>
          )
      }
      <section aria-labelledby="comitologie">
        {
          gouvernanceViewModel.comites ? (
            <ComitologieRemplie comites={gouvernanceViewModel.comites} />
          ) : (
            <ComitologieVide />
          )
        }
      </section>
      <section aria-labelledby="membre">
        {
          gouvernanceViewModel.sectionMembres.membres ? (
            <MembreRempli
              detailDuNombreDeChaqueMembre={gouvernanceViewModel.sectionMembres.detailDuNombreDeChaqueMembre}
              membres={gouvernanceViewModel.sectionMembres.membres}
              nombreDeMembres={`${gouvernanceViewModel.sectionMembres.total} ${gouvernanceViewModel.sectionMembres.wording}`}
            />
          ) : (
            <MembreVide />
          )
        }
      </section>
      <section aria-labelledby="feuilleDeRoute">
        {
          gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute ? (
            <FeuilleDeRouteRemplie
              budgetTotalCumule={gouvernanceViewModel.sectionFeuillesDeRoute.budgetTotalCumule}
              feuillesDeRoute={gouvernanceViewModel.sectionFeuillesDeRoute.feuillesDeRoute}
              nombreDeFeuillesDeRoute={`${gouvernanceViewModel.sectionFeuillesDeRoute.total} ${gouvernanceViewModel.sectionFeuillesDeRoute.wording}`}
            />
          ) : (
            <FeuilleDeRouteVide />
          )
        }
      </section>
      <section aria-labelledby="noteDeContexte">
        {
          gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte ? (
            <NoteDeContexteRemplie
              sousTitre={gouvernanceViewModel.sectionNoteDeContexte.sousTitre}
              texte={gouvernanceViewModel.sectionNoteDeContexte.noteDeContexte.texteAvecHTML}
            />
          ) : (
            <NoteDeContexteVide />
          )
        }
      </section>
    </>
  )
}

type GouvernanceProps = Readonly<{
  gouvernanceViewModel: GouvernanceViewModel
}>
