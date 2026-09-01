'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { ReactElement, useEffect, useState } from 'react'

import styles from './Header.module.css'
import { rechercherTerritoires } from './rechercherTerritoires'
import departements from '../../../../ressources/departements.json'
import regions from '../../../../ressources/regions.json'
import FilAriane from '../FilAriane/FilAriane'
import RechercheTerritoire from '@/components/shared/Select/RechercheTerritoire'
import { TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

// Niveaux territoriaux autorisés pour les sections qui ne couvrent pas tous les niveaux
const niveauxParSection: Readonly<Record<string, ReadonlyArray<string> | undefined>> = {
  'feuille-de-route': ['departement'],
  gouvernances: ['departement', 'epci'],
}

export default function Header({ titre }: Props): ReactElement {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const [epci, setEpci] = useState<null | TerritoireViewModel>(null)
  const [departementEpci, setDepartementEpci] = useState<null | string>(null)

  // L'URL publique du site vitrine peut omettre le préfixe /vitrine (réécriture du proxy) : la section
  // est le segment qui suit toujours « donnees-territoriales »
  const pathParts = pathname.split('/').filter(Boolean)
  const currentSection = pathParts[pathParts.indexOf('donnees-territoriales') + 1] || 'synthese-et-indicateurs'

  // Extraire niveau et code depuis params
  const niveau = params.niveau as string | undefined

  const codeArray = params.code as ReadonlyArray<string> | undefined
  const code = codeArray?.[0]

  // Le nom des EPCI n'est pas embarqué côté client : on le récupère via la recherche par code.
  useEffect(() => {
    if (niveau !== 'epci' || code === undefined) {
      setEpci(null)
      setDepartementEpci(null)
      return
    }
    let annule = false
    void rechercherTerritoires(code).then((readModel) => {
      const territoire = readModel.territoires.find(
        (leTerritoire) => leTerritoire.type === 'epci' && leTerritoire.code === code
      )
      if (!annule && territoire !== undefined) {
        setEpci({
          code: territoire.code,
          label: territoire.nom,
          type: 'epci',
          value: `epci-${territoire.code}`,
        })
        setDepartementEpci(territoire.numeroDepartement)
      }
    })
    return (): void => {
      annule = true
    }
  }, [niveau, code])

  const territoireActuel = getTerritoireLabel(niveau, code, epci)
  const territoireInitial = getTerritoireInitial(niveau, code, epci)

  function handleTerritoireChange(territoire: null | TerritoireViewModel): void {
    if (territoire === null) {
      return
    }
    // Certaines sections n'existent pas à tous les niveaux territoriaux : repli sur la synthèse
    const niveauxAutorises = niveauxParSection[currentSection]
    const section =
      niveauxAutorises === undefined || niveauxAutorises.includes(territoire.type)
        ? currentSection
        : 'synthese-et-indicateurs'
    router.push(`/vitrine/donnees-territoriales/${section}/${territoire.type}/${territoire.code}`)
  }

  const breadcrumbItems = getBreadcrumbItems(niveau, code, currentSection, epci, departementEpci)

  return (
    <div className={styles.header} data-donnees-territoriales-header>
      <FilAriane items={breadcrumbItems} />

      <div className={`fr-grid-row fr-grid-row--gutters ${styles.titleRow}`}>
        <div className="fr-col-12 fr-col-md-8">
          <h1 className={`fr-mb-0 ${styles.title}`}>
            {titre}
            <br />
            {territoireActuel}
          </h1>
        </div>
        <div className="fr-col-12 fr-col-md-4">
          <RechercheTerritoire
            id="rechercheTerritoireHeader"
            key={`${niveau ?? ''}-${code ?? ''}-${territoireInitial === null ? 'sans-valeur' : 'avec-valeur'}`}
            onSelectionner={handleTerritoireChange}
            rechercher={rechercherTerritoires}
            valeurInitiale={territoireInitial}
          />
        </div>
      </div>
    </div>
  )
}

function getTerritoireLabel(niveau?: string, code?: string, epci?: null | TerritoireViewModel): string {
  if (niveau === undefined || niveau === '' || code === undefined) {
    return 'France'
  }

  if (niveau === 'region') {
    const region = regions.find((region) => region.code === code)
    return region ? region.nom : `Région ${code}`
  }

  if (niveau === 'departement') {
    const departement = departements.find((departement) => departement.code === code)
    return departement ? `${departement.nom} · ${code}` : `Département ${code}`
  }

  if (niveau === 'epci') {
    return epci?.label ?? `Intercommunalité ${code}`
  }

  return 'France'
}

function getTerritoireInitial(
  niveau?: string,
  code?: string,
  epci?: null | TerritoireViewModel
): null | TerritoireViewModel {
  if (code === undefined) {
    return null
  }

  if (niveau === 'departement') {
    const departement = departements.find((departement) => departement.code === code)
    if (departement === undefined) {
      return null
    }
    return {
      code,
      label: `${departement.nom} · ${code}`,
      type: 'departement',
      value: `departement-${code}`,
    }
  }

  if (niveau === 'region') {
    const region = regions.find((region) => region.code === code)
    if (region === undefined) {
      return null
    }
    return {
      code,
      label: region.nom,
      type: 'region',
      value: `region-${code}`,
    }
  }

  if (niveau === 'epci') {
    return epci ?? null
  }

  return null
}

function getBreadcrumbItems(
  niveau?: string,
  code?: string,
  currentSection?: string,
  epci?: null | TerritoireViewModel,
  departementEpci?: null | string
): Array<{ href?: string; label: string }> {
  const section = currentSection ?? 'synthese-et-indicateurs'

  const items: Array<{ href?: string; label: string }> = [
    { href: '/vitrine', label: 'Accueil' },
    { href: '/vitrine/donnees-territoriales', label: 'Données territoriales' },
    { href: `/vitrine/donnees-territoriales/${section}/national`, label: 'France' },
  ]

  if (niveau === undefined || niveau === '' || code === undefined) {
    return items
  }

  if (niveau === 'region') {
    const region = regions.find((region) => region.code === code)
    if (region !== undefined) {
      items.push({
        href: `/vitrine/donnees-territoriales/${section}/region/${code}`,
        label: region.nom,
      })
    }
  }

  if (niveau === 'departement') {
    const departementCourant = departements.find((departement) => departement.code === code)
    if (departementCourant !== undefined) {
      const regionCourante = regions.find((region) => region.code === departementCourant.regionCode)
      if (regionCourante !== undefined) {
        items.push({
          href: `/vitrine/donnees-territoriales/synthese-et-indicateurs/region/${regionCourante.code}`,
          label: regionCourante.nom,
        })
      }
      items.push({
        href: `/vitrine/donnees-territoriales/${section}/departement/${code}`,
        label: `${departementCourant.nom} · ${code}`,
      })
    }
  }

  if (niveau === 'epci') {
    items.push(...getBreadcrumbItemsEpci(section, code, epci, departementEpci))
  }

  return items
}

// Région et département de rattachement de l'EPCI (connus après la recherche par code)
function getBreadcrumbItemsEpci(
  section: string,
  code?: string,
  epci?: null | TerritoireViewModel,
  departementEpci?: null | string
): Array<{ href?: string; label: string }> {
  const items: Array<{ href?: string; label: string }> = []
  const departementRattachement = departements.find((departement) => departement.code === departementEpci)
  if (departementRattachement !== undefined) {
    const regionRattachement = regions.find((region) => region.code === departementRattachement.regionCode)
    if (regionRattachement !== undefined) {
      items.push({
        href: `/vitrine/donnees-territoriales/synthese-et-indicateurs/region/${regionRattachement.code}`,
        label: regionRattachement.nom,
      })
    }
    items.push({
      href: `/vitrine/donnees-territoriales/${section}/departement/${departementRattachement.code}`,
      label: `${departementRattachement.nom} · ${departementRattachement.code}`,
    })
  }
  items.push({ label: epci?.label ?? `Intercommunalité ${code}` })
  return items
}

type Props = Readonly<{
  titre: string
}>
