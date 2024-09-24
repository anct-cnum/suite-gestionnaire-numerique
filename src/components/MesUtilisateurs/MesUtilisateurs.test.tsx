import { screen, within } from '@testing-library/react'

import MesUtilisateurs from './MesUtilisateurs'
import { TypologieRole } from '@/domain/Role'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { renderComponent, infosSessionUtilisateurContext } from '@/testHelper'
import { MesUtilisateursReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'

describe('mes utilisateurs', () => {
  const pageCourante = 0
  const totalUtilisateur = 11

  it('quand j’affiche mes utilisateurs alors s’affiche l’en-tête', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Gestion de mes utilisateurs' })
    expect(titre).toBeInTheDocument()

    const InviterUnePersonne = screen.getByRole('button', { name: 'Inviter une personne' })
    expect(InviterUnePersonne).toHaveAttribute('type', 'button')

    const { columnsHead } = getByTable()
    expect(columnsHead).toHaveLength(7)
    expect(columnsHead[0].textContent).toBe(' ')
    expect(columnsHead[1].textContent).toBe('Utilisateur')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Adresse électronique')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Rôle')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')
    expect(columnsHead[4].textContent).toBe('Dernière connexion')
    expect(columnsHead[4]).toHaveAttribute('scope', 'col')
    expect(columnsHead[5].textContent).toBe('Statut')
    expect(columnsHead[5]).toHaveAttribute('scope', 'col')
    expect(columnsHead[6].textContent).toBe('Action')
    expect(columnsHead[6]).toHaveAttribute('scope', 'col')
  })

  it.each([
    {
      role: 'Administrateur dispositif' as TypologieRole,
    },
    {
      role: 'Instructeur' as TypologieRole,
    },
    {
      role: 'Pilote politique publique' as TypologieRole,
    },
    {
      role: 'Support animation' as TypologieRole,
    },
  ])('faisant parti du groupe admin quand j’affiche mes utilisateurs alors je peux rechercher un utilisateur, filtrer et exporter la liste', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const rechercher = screen.getByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('placeholder', 'Rechercher par nom ou adresse électronique')
    expect(rechercher).toHaveAttribute('type', 'search')
    const boutonRechercher = screen.getByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).toHaveAttribute('type', 'button')

    const filtrer = screen.getByRole('button', { name: 'Filtrer' })
    expect(filtrer).toHaveAttribute('type', 'button')
    const exporter = screen.getByRole('button', { name: 'Exporter' })
    expect(exporter).toHaveAttribute('type', 'button')
  })

  it.each([
    {
      role: 'Gestionnaire département' as TypologieRole,
    },
    {
      role: 'Gestionnaire région' as TypologieRole,
    },
    {
      role: 'Gestionnaire structure' as TypologieRole,
    },
    {
      role: 'Gestionnaire groupement' as TypologieRole,
    },
  ])('faisant parti du groupe gestionnaire quand j’affiche mes utilisateurs alors j’ai juste un sous titre', ({ role }) => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(
      <MesUtilisateurs
        mesUtilisateursViewModel={mesUtilisateursViewModel}
      />,
      {
        ...infosSessionUtilisateurContext,
        session: {
          ...infosSessionUtilisateurContext.session,
          role: {
            groupe: 'gestionnaire',
            libelle: 'Rhône',
            nom: role,
            pictogramme: 'maille',
          },
        },
      }
    )

    // THEN
    const rechercher = screen.queryByLabelText('Rechercher par nom ou adresse électronique')
    expect(rechercher).not.toBeInTheDocument()
    const boutonRechercher = screen.queryByRole('button', { name: 'Rechercher' })
    expect(boutonRechercher).not.toBeInTheDocument()

    const filtrer = screen.queryByRole('button', { name: 'Filtrer' })
    expect(filtrer).not.toBeInTheDocument()
    const exporter = screen.queryByRole('button', { name: 'Exporter' })
    expect(exporter).not.toBeInTheDocument()

    const sousTitre = screen.getByText('Gérez l’accès à l’espace de gestion', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
  })

  it('sur la ligne d’un utilisateur actif quand j’affiche mes utilisateurs alors il s’affiche avec ses informations', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    expect(columnsBody).toHaveLength(7)
    expect(within(columnsBody[0]).getByRole('presentation')).toHaveAttribute('alt', '')
    expect(columnsBody[1].textContent).toBe('Martin TartempionPréfecture du Rhône')
    expect(columnsBody[2].textContent).toBe('martin.tartempion@example.net')
    expect(columnsBody[3].textContent).toBe('Administrateur dispositif')
    expect(columnsBody[4].textContent).toBe('05/03/2024')
    expect(columnsBody[5].textContent).toBe('Activé')
  })

  it('sur la ligne d’un utilisateur inactif quand j’affiche mes utilisateurs alors il s’affiche avec ce statut et sa date d’invitation', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    expect(columnsBody[4].textContent).toBe('invité le 12/02/2024')
    expect(columnsBody[5].textContent).toBe('En attente')
  })

  it('sur ma ligne quand j’affiche mes utilisateurs alors je ne peux pas me supprimer', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[0]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeDisabled()
  })

  it('sur la ligne d’un utilisateur quand j’affiche mes utilisateurs alors je peux le supprimer', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const { rowsBody } = getByTable()
    const columnsBody = within(rowsBody[1]).getAllByRole('cell')
    const supprimer = within(columnsBody[6]).getByRole('button', { name: 'Supprimer' })
    expect(supprimer).toHaveAttribute('type', 'button')
    expect(supprimer).toBeEnabled()
  })

  it('quand j’affiche mes utilisateurs alors s’affiche la pagination', () => {
    // GIVEN
    const mesUtilisateursViewModel = mesUtilisateursPresenter(mesUtilisateursReadModel, '7396c91e-b9f2-4f9d-8547-5e9b3332725b', pageCourante, totalUtilisateur)

    // WHEN
    renderComponent(<MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Pagination' })
    expect(navigation).toBeInTheDocument()
  })
})

function getByTable() {
  const mesUtilisateurs = screen.getByRole('table', { name: 'Mes utilisateurs' })
  const rowsGroup = within(mesUtilisateurs).getAllByRole('rowgroup')

  const head = rowsGroup[0]
  const rowHead = within(head).getByRole('row')
  const columnsHead = within(rowHead).getAllByRole('columnheader')

  const body = rowsGroup[1]
  const rowsBody = within(body).getAllByRole('row')

  return { columnsHead, rowsBody }
}

const mesUtilisateursReadModel: ReadonlyArray<MesUtilisateursReadModel> = [
  {
    departementCode: null,
    derniereConnexion: new Date('2024-03-05'),
    email: 'martin.tartempion@example.net',
    groupementId: null,
    inviteLe: new Date('2024-03-01'),
    isActive: true,
    isSuperAdmin: true,
    nom: 'Tartempion',
    prenom: 'Martin',
    regionCode: null,
    role: {
      categorie: 'anct',
      groupe: 'admin',
      nom: 'Administrateur dispositif',
      territoireOuStructure: 'Préfecture du Rhône',
    },
    structureId: null,
    uid: '7396c91e-b9f2-4f9d-8547-5e9b3332725b',
  },
  {
    departementCode: null,
    derniereConnexion: new Date(0),
    email: 'julien.deschamps@example.com',
    groupementId: null,
    inviteLe: new Date('2024-02-12'),
    isActive: false,
    isSuperAdmin: false,
    nom: 'Deschamps',
    prenom: 'Julien',
    regionCode: null,
    role: {
      categorie: 'structure',
      groupe: 'gestionnaire',
      nom: 'Gestionnaire structure',
      territoireOuStructure: 'Hub du Rhône',
    },
    structureId: 1,
    uid: '123456',
  },
]
