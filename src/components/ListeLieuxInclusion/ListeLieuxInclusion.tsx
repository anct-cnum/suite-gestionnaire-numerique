'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useEffect, useId, useState } from 'react'

import Badge from '../shared/Badge/Badge'
import Drawer from '../shared/Drawer/Drawer'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import PageTitle from '../shared/PageTitle/PageTitle'
import Pagination from '../shared/Pagination/Pagination'
import Select from '../shared/Select/Select'
import SpinnerSimple from '../shared/Spinner/SpinnerSimple'
import Table from '../shared/Table/Table'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import ListeLieuxInclusionInfo from '@/components/ListeLieuxInclusion/ListeLieuxInclusionInfo'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { ListeLieuxInclusionViewModel } from '@/presenters/listeLieuxInclusionPresenter'
import { LabelValue } from '@/presenters/shared/labels'

const FILTER_URL_PARAM = 'filtre'

export default function ListeLieuxInclusion({
  listeLieuxInclusionViewModel,
}: Props): ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPageLoading = useNavigationLoading() // Spinner immédiat au clic
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [selectedStructureType, setSelectedStructureType] = useState<string>('')
  const [isQpvSelected, setIsQpvSelected] = useState<boolean>(false)
  const [isFrrSelected, setIsFrrSelected] = useState<boolean>(false)
  const drawerId = 'drawerFiltreLieux'
  const labelId = useId()
  const zoneSelectId = useId()
  const structureTypeSelectId = useId()
  const qpvCheckboxId = useId()
  const frrCheckboxId = useId()

  function encodeFilters(filters: FilterState): string {
    try {
      const filterString = JSON.stringify(filters)
      return btoa(filterString)
    } catch {
      return ''
    }
  }

  function decodeFilters(encoded: string): FilterState | null {
    try {
      const decoded = atob(encoded)
      const parsed: unknown = JSON.parse(decoded)

      // Validation stricte des données décodées
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const obj = parsed as Record<string, unknown>
        return {
          frr: Boolean(obj.frr),
          qpv: Boolean(obj.qpv),
          typeStructure: typeof obj.typeStructure === 'string' ? obj.typeStructure : '',
          zone: typeof obj.zone === 'string' ? obj.zone : '',
        }
      }
      return null
    } catch {
      return null
    }
  }

  function handleResetFilters(): void {
    setSelectedZone('')
    setSelectedStructureType('')
    setIsQpvSelected(false)
    setIsFrrSelected(false)
  }

  // Charger les filtres depuis l'URL au montage du composant
  useEffect(() => {
    const encodedFilters = searchParams.get(FILTER_URL_PARAM)
    if (encodedFilters !== null) {
      const decodedFilters = decodeFilters(encodedFilters)
      if (decodedFilters) {
        setSelectedZone(decodedFilters.zone)
        setSelectedStructureType(decodedFilters.typeStructure)
        setIsQpvSelected(decodedFilters.qpv)
        setIsFrrSelected(decodedFilters.frr)
      }
    }
  }, [searchParams])

  function handleApplyFilters(): void {
    const filters: FilterState = {
      frr: isFrrSelected,
      qpv: isQpvSelected,
      typeStructure: selectedStructureType,
      zone: selectedZone,
    }

    const hasFilters = Boolean(filters.zone) || Boolean(filters.typeStructure) || filters.qpv || filters.frr

    let newUrl = '/liste-lieux-inclusion'

    if (hasFilters) {
      const encoded = encodeFilters(filters)
      if (encoded) {
        newUrl = `/liste-lieux-inclusion?${FILTER_URL_PARAM}=${encoded}`
      }
    }

    router.push(newUrl)
    setIsDrawerOpen(false)
    window.location.reload()
  }

  const zonesGeographiques: ReadonlyArray<LabelValue> = [
    { isSelected: selectedZone === '', label: 'Toutes les zones', value: '' },
    { isSelected: selectedZone === '01', label: 'Ain (01)', value: '01' },
    { isSelected: selectedZone === '02', label: 'Aisne (02)', value: '02' },
    { isSelected: selectedZone === '03', label: 'Allier (03)', value: '03' },
    { isSelected: selectedZone === '04', label: 'Alpes-de-Haute-Provence (04)', value: '04' },
    { isSelected: selectedZone === '05', label: 'Hautes-Alpes (05)', value: '05' },
    { isSelected: selectedZone === '06', label: 'Alpes-Maritimes (06)', value: '06' },
    { isSelected: selectedZone === '07', label: 'Ardèche (07)', value: '07' },
    { isSelected: selectedZone === '08', label: 'Ardennes (08)', value: '08' },
    { isSelected: selectedZone === '09', label: 'Ariège (09)', value: '09' },
    { isSelected: selectedZone === '10', label: 'Aube (10)', value: '10' },
    { isSelected: selectedZone === '11', label: 'Aude (11)', value: '11' },
    { isSelected: selectedZone === '12', label: 'Aveyron (12)', value: '12' },
    { isSelected: selectedZone === '13', label: 'Bouches-du-Rhône (13)', value: '13' },
    { isSelected: selectedZone === '14', label: 'Calvados (14)', value: '14' },
    { isSelected: selectedZone === '15', label: 'Cantal (15)', value: '15' },
    { isSelected: selectedZone === '16', label: 'Charente (16)', value: '16' },
    { isSelected: selectedZone === '17', label: 'Charente-Maritime (17)', value: '17' },
    { isSelected: selectedZone === '18', label: 'Cher (18)', value: '18' },
    { isSelected: selectedZone === '19', label: 'Corrèze (19)', value: '19' },
    { isSelected: selectedZone === '2A', label: 'Corse-du-Sud (2A)', value: '2A' },
    { isSelected: selectedZone === '2B', label: 'Haute-Corse (2B)', value: '2B' },
    { isSelected: selectedZone === '21', label: 'Côte-d\'Or (21)', value: '21' },
    { isSelected: selectedZone === '22', label: 'Côtes-d\'Armor (22)', value: '22' },
    { isSelected: selectedZone === '23', label: 'Creuse (23)', value: '23' },
    { isSelected: selectedZone === '24', label: 'Dordogne (24)', value: '24' },
    { isSelected: selectedZone === '25', label: 'Doubs (25)', value: '25' },
    { isSelected: selectedZone === '26', label: 'Drôme (26)', value: '26' },
    { isSelected: selectedZone === '27', label: 'Eure (27)', value: '27' },
    { isSelected: selectedZone === '28', label: 'Eure-et-Loir (28)', value: '28' },
    { isSelected: selectedZone === '29', label: 'Finistère (29)', value: '29' },
    { isSelected: selectedZone === '30', label: 'Gard (30)', value: '30' },
    { isSelected: selectedZone === '31', label: 'Haute-Garonne (31)', value: '31' },
    { isSelected: selectedZone === '32', label: 'Gers (32)', value: '32' },
    { isSelected: selectedZone === '33', label: 'Gironde (33)', value: '33' },
    { isSelected: selectedZone === '34', label: 'Hérault (34)', value: '34' },
    { isSelected: selectedZone === '35', label: 'Ille-et-Vilaine (35)', value: '35' },
    { isSelected: selectedZone === '36', label: 'Indre (36)', value: '36' },
    { isSelected: selectedZone === '37', label: 'Indre-et-Loire (37)', value: '37' },
    { isSelected: selectedZone === '38', label: 'Isère (38)', value: '38' },
    { isSelected: selectedZone === '39', label: 'Jura (39)', value: '39' },
    { isSelected: selectedZone === '40', label: 'Landes (40)', value: '40' },
    { isSelected: selectedZone === '41', label: 'Loir-et-Cher (41)', value: '41' },
    { isSelected: selectedZone === '42', label: 'Loire (42)', value: '42' },
    { isSelected: selectedZone === '43', label: 'Haute-Loire (43)', value: '43' },
    { isSelected: selectedZone === '44', label: 'Loire-Atlantique (44)', value: '44' },
    { isSelected: selectedZone === '45', label: 'Loiret (45)', value: '45' },
    { isSelected: selectedZone === '46', label: 'Lot (46)', value: '46' },
    { isSelected: selectedZone === '47', label: 'Lot-et-Garonne (47)', value: '47' },
    { isSelected: selectedZone === '48', label: 'Lozère (48)', value: '48' },
    { isSelected: selectedZone === '49', label: 'Maine-et-Loire (49)', value: '49' },
    { isSelected: selectedZone === '50', label: 'Manche (50)', value: '50' },
    { isSelected: selectedZone === '51', label: 'Marne (51)', value: '51' },
    { isSelected: selectedZone === '52', label: 'Haute-Marne (52)', value: '52' },
    { isSelected: selectedZone === '53', label: 'Mayenne (53)', value: '53' },
    { isSelected: selectedZone === '54', label: 'Meurthe-et-Moselle (54)', value: '54' },
    { isSelected: selectedZone === '55', label: 'Meuse (55)', value: '55' },
    { isSelected: selectedZone === '56', label: 'Morbihan (56)', value: '56' },
    { isSelected: selectedZone === '57', label: 'Moselle (57)', value: '57' },
    { isSelected: selectedZone === '58', label: 'Nièvre (58)', value: '58' },
    { isSelected: selectedZone === '59', label: 'Nord (59)', value: '59' },
    { isSelected: selectedZone === '60', label: 'Oise (60)', value: '60' },
    { isSelected: selectedZone === '61', label: 'Orne (61)', value: '61' },
    { isSelected: selectedZone === '62', label: 'Pas-de-Calais (62)', value: '62' },
    { isSelected: selectedZone === '63', label: 'Puy-de-Dôme (63)', value: '63' },
    { isSelected: selectedZone === '64', label: 'Pyrénées-Atlantiques (64)', value: '64' },
    { isSelected: selectedZone === '65', label: 'Hautes-Pyrénées (65)', value: '65' },
    { isSelected: selectedZone === '66', label: 'Pyrénées-Orientales (66)', value: '66' },
    { isSelected: selectedZone === '67', label: 'Bas-Rhin (67)', value: '67' },
    { isSelected: selectedZone === '68', label: 'Haut-Rhin (68)', value: '68' },
    { isSelected: selectedZone === '69', label: 'Rhône (69)', value: '69' },
    { isSelected: selectedZone === '70', label: 'Haute-Saône (70)', value: '70' },
    { isSelected: selectedZone === '71', label: 'Saône-et-Loire (71)', value: '71' },
    { isSelected: selectedZone === '72', label: 'Sarthe (72)', value: '72' },
    { isSelected: selectedZone === '73', label: 'Savoie (73)', value: '73' },
    { isSelected: selectedZone === '74', label: 'Haute-Savoie (74)', value: '74' },
    { isSelected: selectedZone === '75', label: 'Paris (75)', value: '75' },
    { isSelected: selectedZone === '76', label: 'Seine-Maritime (76)', value: '76' },
    { isSelected: selectedZone === '77', label: 'Seine-et-Marne (77)', value: '77' },
    { isSelected: selectedZone === '78', label: 'Yvelines (78)', value: '78' },
    { isSelected: selectedZone === '79', label: 'Deux-Sèvres (79)', value: '79' },
    { isSelected: selectedZone === '80', label: 'Somme (80)', value: '80' },
    { isSelected: selectedZone === '81', label: 'Tarn (81)', value: '81' },
    { isSelected: selectedZone === '82', label: 'Tarn-et-Garonne (82)', value: '82' },
    { isSelected: selectedZone === '83', label: 'Var (83)', value: '83' },
    { isSelected: selectedZone === '84', label: 'Vaucluse (84)', value: '84' },
    { isSelected: selectedZone === '85', label: 'Vendée (85)', value: '85' },
    { isSelected: selectedZone === '86', label: 'Vienne (86)', value: '86' },
    { isSelected: selectedZone === '87', label: 'Haute-Vienne (87)', value: '87' },
    { isSelected: selectedZone === '88', label: 'Vosges (88)', value: '88' },
    { isSelected: selectedZone === '89', label: 'Yonne (89)', value: '89' },
    { isSelected: selectedZone === '90', label: 'Territoire de Belfort (90)', value: '90' },
    { isSelected: selectedZone === '91', label: 'Essonne (91)', value: '91' },
    { isSelected: selectedZone === '92', label: 'Hauts-de-Seine (92)', value: '92' },
    { isSelected: selectedZone === '93', label: 'Seine-Saint-Denis (93)', value: '93' },
    { isSelected: selectedZone === '94', label: 'Val-de-Marne (94)', value: '94' },
    { isSelected: selectedZone === '95', label: 'Val-d\'Oise (95)', value: '95' },
    { isSelected: selectedZone === '971', label: 'Guadeloupe (971)', value: '971' },
    { isSelected: selectedZone === '972', label: 'Martinique (972)', value: '972' },
    { isSelected: selectedZone === '973', label: 'Guyane (973)', value: '973' },
    { isSelected: selectedZone === '974', label: 'La Réunion (974)', value: '974' },
    { isSelected: selectedZone === '976', label: 'Mayotte (976)', value: '976' },
  ]

  const typesStructure: ReadonlyArray<LabelValue> = [
    { isSelected: selectedStructureType === '', label: 'Tous les types', value: '' },
    { isSelected: selectedStructureType === 'Association', label: 'Association', value: 'Association' },
    { isSelected: selectedStructureType === 'Collectivité, commune', label: 'Collectivité, commune', value: 'Collectivité, commune' },
    { isSelected: selectedStructureType === 'Collectivité, conseil départemental', label: 'Collectivité, conseil départemental', value: 'Collectivité, conseil départemental' },
    { isSelected: selectedStructureType === 'Collectivité, conseil régional', label: 'Collectivité, conseil régional', value: 'Collectivité, conseil régional' },
    { isSelected: selectedStructureType === 'Collectivité, EPCI', label: 'Collectivité, EPCI', value: 'Collectivité, EPCI' },
    { isSelected: selectedStructureType === 'Entreprise privée', label: 'Entreprise privée', value: 'Entreprise privée' },
    { isSelected: selectedStructureType === 'Établissement public', label: 'Établissement public', value: 'Établissement public' },
    { isSelected: selectedStructureType === 'Organisme public', label: 'Organisme public', value: 'Organisme public' },
    { isSelected: selectedStructureType === 'Préfecture départementale', label: 'Préfecture départementale', value: 'Préfecture départementale' },
    { isSelected: selectedStructureType === 'Structure de l\'insertion par l\'activité économique', label: 'Structure de l\'insertion par l\'activité économique', value: 'Structure de l\'insertion par l\'activité économique' },
  ]

  if ('type' in listeLieuxInclusionViewModel) {
    return (
      <div className="fr-alert fr-alert--error">
        <p>
          {listeLieuxInclusionViewModel.message}
        </p>
      </div>
    )
  }

  const viewModel = listeLieuxInclusionViewModel

  return (
    <>
      {isPageLoading ? (
        <div
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            left: 0,
            position: 'fixed',
            right: 0,
            top: 0,
            zIndex: 9999,
          }}
        >
          <SpinnerSimple
            size="large"
            text="Chargement..."
          />
        </div>
      ) : null}

      <div className="fr-grid-row fr-grid-row--middle">
        <div className="fr-col">
          <PageTitle>
            <TitleIcon icon="map-pin-2-line" />
            Suivi des lieux d&apos;inclusion numérique
          </PageTitle>
        </div>
        <div className="fr-col-auto">
          <button
            aria-controls={drawerId}
            className="fr-btn fr-btn--secondary fr-btn--icon-left fr-fi-filter-line"
            data-fr-opened="false"
            onClick={() => { setIsDrawerOpen(true) }}
            type="button"
          >
            Filtres
          </button>
        </div>
      </div>

      {viewModel.lieux.length === 0 ? (
        <p>
          Aucun lieu d&apos;inclusion numérique trouvé.
        </p>
      ) : (
        <>
          <ListeLieuxInclusionInfo infos={{
            total: viewModel.total,
            totalConseillerNumerique: viewModel.totalConseillerNumerique,
            totalLabellise: viewModel.totalLabellise,
          }}
          />
          <Table
            enTetes={[
              'Lieu',
              'Adresse',
              'Siret',
              'FRR / QPV',
              'Mandats AC',
              'Nb Accompagnements',
              //'Action',
            ]}
            titre="Lieux d'inclusion numérique"
          >
            {viewModel.lieux.map((lieu) => (
              <tr key={lieu.id}>
                <td style={{ maxWidth: '25vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    <strong
                      title={lieu.nom}
                    >
                      {lieu.nom}
                    </strong>
                    <br />
                    <span
                      className="fr-text--sm"
                      title={lieu.typeStructure}
                    >
                      {lieu.typeStructure}
                    </span>
                  </div>
                </td>
                <td style={{ maxWidth: '20vw' }}>
                  <div style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    {lieu.idCartographieNationale === null ?
                      lieu.adresse
                      : (
                        <a
                          href={`https://cartographie.societenumerique.gouv.fr/cartographie/${lieu.idCartographieNationale}/details`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {lieu.adresse}
                        </a>
                      )}
                  </div>
                </td>
                <td>
                  {lieu.siret === null ? 'Non renseigné' :
                    (
                      <a
                        href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${lieu.siret}`}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {lieu.siret}
                      </a>
                    ) }
                </td>
                <td>
                  <div className="fr-tags-group">
                    {lieu.tags.map((tag) => (
                      <Badge
                        color={tag.couleur}
                        key={`${lieu.id}-tag-${tag.libelle}`}
                      >
                        {tag.libelle}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="fr-cell--center">
                  {lieu.nbMandatsAC}
                </td>
                <td className="fr-cell--center">
                  {lieu.nbAccompagnements}
                </td>
                <td
                  className="fr-cell--center"
                  style={{ display: 'none' }}
                >
                  <Link
                    className="fr-btn fr-btn--secondary fr-btn--sm"
                    href={`/lieu/${lieu.id}`}
                  >
                    Détail
                  </Link>
                </td>
              </tr>
            ))}
          </Table>

          {viewModel.displayPagination ? (
            <div className="fr-grid-row fr-grid-row--center fr-mt-3w">
              <Pagination
                pathname="/liste-lieux-inclusion"
                totalUtilisateurs={viewModel.total}
              />
            </div>
          ) : null}
        </>
      )}

      <Drawer
        boutonFermeture="Fermer les filtres"
        closeDrawer={() => { setIsDrawerOpen(false) }}
        id={drawerId}
        isFixedWidth={false}
        isOpen={isDrawerOpen}
        labelId={labelId}
      >
        <DrawerTitle id={labelId}>
          <TitleIcon
            icon="filter-line"
          />
          <br />
          Filtrer les lieux
        </DrawerTitle>
        <div className="fr-p-2w">
          <Select<string>
            id={zoneSelectId}
            name="zoneGeographique"
            onChange={(event) => { setSelectedZone(event.target.value) }}
            options={zonesGeographiques}
            placeholder="Choisir une zone"
          >
            Par zone géographique
          </Select>

          <Select<string>
            id={structureTypeSelectId}
            name="typeStructure"
            onChange={(event) => { setSelectedStructureType(event.target.value) }}
            options={typesStructure}
            placeholder="Choisir un type"
          >
            Par typologie de structure
          </Select>

          <div className="fr-fieldset">
            <legend className="fr-fieldset__legend fr-text--regular">
              Typologie de territoire
            </legend>
            <div className="fr-fieldset__content">
              <div className="fr-checkbox-group">
                <input
                  checked={isQpvSelected}
                  id={qpvCheckboxId}
                  name="qpv"
                  onChange={(event) => { setIsQpvSelected(event.target.checked) }}
                  type="checkbox"
                  value="qpv"
                />
                <label
                  className="fr-label"
                  htmlFor={qpvCheckboxId}
                >
                  QPV
                </label>
              </div>
              <div className="fr-checkbox-group">
                <input
                  checked={isFrrSelected}
                  id={frrCheckboxId}
                  name="frr"
                  onChange={(event) => { setIsFrrSelected(event.target.checked) }}
                  type="checkbox"
                  value="frr"
                />
                <label
                  className="fr-label"
                  htmlFor={frrCheckboxId}
                >
                  FRR
                </label>
              </div>
            </div>
          </div>

          <div className="fr-btns-group fr-mt-3w">
            <button
              className="fr-btn"
              onClick={handleApplyFilters}
              type="button"
            >
              Afficher les lieux
            </button>
            <button
              className="fr-btn fr-btn--secondary"
              onClick={handleResetFilters}
              type="button"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

type FilterState = {
  frr: boolean
  qpv: boolean
  typeStructure: string
  zone: string
}

type Props = Readonly<{
  listeLieuxInclusionViewModel: ErrorViewModel | ListeLieuxInclusionViewModel
}>
