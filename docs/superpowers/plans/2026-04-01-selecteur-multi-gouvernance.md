# Sélecteur multi-gouvernance — Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un utilisateur appartenant à plusieurs gouvernances de switcher entre leurs dashboards via un sélecteur, sans page intermédiaire.

**Architecture:** On ajoute un composant `SelecteurGouvernance` (client, react-select) sur `/tableau-de-bord` (inchangé) et sur la nouvelle page `/tableau-de-bord/[codeDepartement]`. Le serveur dérive la liste des gouvernances accessibles depuis `contexte.codesDepartements()` existant. Une nouvelle méthode `filtrerPourDepartement` sur `Contexte` permet de scoper les blocs sur la gouvernance sélectionnée.

**Tech Stack:** Next.js 15 App Router, React, react-select, react-select-event (tests), Vitest + Testing Library

---

## Fichiers impactés

| Action | Fichier |
|---|---|
| Créer | `src/presenters/tableauDeBord/selecteurGouvernancePresenter.ts` |
| Créer | `src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts` |
| Modifier | `src/use-cases/queries/ResoudreContexte.ts` |
| Modifier | `src/use-cases/queries/ResoudreContexte.test.ts` |
| Créer | `src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.tsx` |
| Créer | `src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx` |
| Modifier | `src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/page.tsx` |
| Créer | `src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/[codeDepartement]/page.tsx` |

---

## Task 1 : Presenter `gouvernancesOptions`

**Files:**
- Create: `src/presenters/tableauDeBord/selecteurGouvernancePresenter.ts`
- Test: `src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts`

- [ ] **Step 1 : Écrire le test qui échoue**

```typescript
// src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts
import { describe, expect, it } from 'vitest'

import { gouvernancesOptions } from './selecteurGouvernancePresenter'

describe('gouvernancesOptions', () => {
  it('transforme des codes département en options label/value', () => {
    // GIVEN
    const codes = ['01', '75']

    // WHEN
    const options = gouvernancesOptions(codes)

    // THEN
    expect(options).toStrictEqual([
      { label: '(01) Ain', value: '01' },
      { label: '(75) Paris', value: '75' },
    ])
  })

  it('retourne une liste vide si aucun code', () => {
    // GIVEN / WHEN / THEN
    expect(gouvernancesOptions([])).toStrictEqual([])
  })

  it('retourne juste le code si le département est introuvable', () => {
    // GIVEN
    const codes = ['99']

    // WHEN
    const options = gouvernancesOptions(codes)

    // THEN
    expect(options).toStrictEqual([{ label: '(99)', value: '99' }])
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
yarn test src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts
```
Expected: FAIL — `Cannot find module './selecteurGouvernancePresenter'`

- [ ] **Step 3 : Implémenter le presenter**

```typescript
// src/presenters/tableauDeBord/selecteurGouvernancePresenter.ts
import departements from '../../../ressources/departements.json'

export type OptionGouvernance = Readonly<{
  label: string
  value: string
}>

export function gouvernancesOptions(
  codesDepartements: ReadonlyArray<string>
): ReadonlyArray<OptionGouvernance> {
  return codesDepartements.map((code) => {
    const departement = departements.find((d) => d.code === code)
    return {
      label: departement ? `(${code}) ${departement.nom}` : `(${code})`,
      value: code,
    }
  })
}
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
yarn test src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts
```
Expected: PASS — 3 tests

- [ ] **Step 5 : Commit**

```bash
git add src/presenters/tableauDeBord/selecteurGouvernancePresenter.ts src/presenters/tableauDeBord/selecteurGouvernancePresenter.test.ts
git commit -m "feat: add gouvernancesOptions presenter for multi-governance selector"
```

---

## Task 2 : `Contexte.filtrerPourDepartement`

**Files:**
- Modify: `src/use-cases/queries/ResoudreContexte.ts` (ajouter la méthode dans la classe `Contexte`, après `peutGererGouvernance`)
- Modify: `src/use-cases/queries/ResoudreContexte.test.ts` (ajouter un describe après les describes existants)

- [ ] **Step 1 : Écrire le test qui échoue**

Ajouter à la fin de `src/use-cases/queries/ResoudreContexte.test.ts`, avant les fonctions utilitaires `utilisateurAvecRole` et `loaderStub` :

```typescript
describe('Contexte.filtrerPourDepartement', () => {
  it('quand un utilisateur est membre de deux gouvernances, filtrer pour l'une retourne codeTerritoire de celle-ci', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_structure', [
      { code: '123', type: 'structure' },
      { code: '75', type: 'membre' },
      { code: '69', type: 'coporteur' },
    ])

    // WHEN
    const contexteFiltré = contexte.filtrerPourDepartement('69')

    // THEN
    expect(contexteFiltré.codeTerritoire()).toBe('69')
    expect(contexteFiltré.estDansGouvernance()).toBe(true)
  })

  it('conserve le scope structure lors du filtrage', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_structure', [
      { code: '123', type: 'structure' },
      { code: '75', type: 'membre' },
      { code: '69', type: 'coporteur' },
    ])

    // WHEN
    const contexteFiltré = contexte.filtrerPourDepartement('69')

    // THEN
    expect(contexteFiltré.idStructure()).toBe(123)
  })

  it('conserve le scope france pour un admin', () => {
    // GIVEN
    const contexte = new Contexte('administrateur_dispositif', [
      { type: 'france' },
    ])

    // WHEN
    const contexteFiltré = contexte.filtrerPourDepartement('75')

    // THEN
    expect(contexteFiltré.estNational()).toBe(true)
  })
})
```

Ajouter l'import `Contexte` en haut du fichier de test (après les imports existants) :

```typescript
import { Contexte, resoudreContexte, ScopeLoader } from './ResoudreContexte'
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
yarn test src/use-cases/queries/ResoudreContexte.test.ts
```
Expected: FAIL — `contexte.filtrerPourDepartement is not a function`

- [ ] **Step 3 : Implémenter la méthode dans la classe `Contexte`**

Dans `src/use-cases/queries/ResoudreContexte.ts`, ajouter après la méthode `peutGererGouvernance` (ligne 98) :

```typescript
  filtrerPourDepartement(codeDepartement: string): Contexte {
    const scopesFiltres = this.scopes.filter((scope) => {
      if (scope.type === 'coporteur' || scope.type === 'membre' || scope.type === 'departement') {
        return 'code' in scope && scope.code === codeDepartement
      }
      return true
    })
    return new Contexte(this.role, scopesFiltres)
  }
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
yarn test src/use-cases/queries/ResoudreContexte.test.ts
```
Expected: PASS — tous les tests du fichier

- [ ] **Step 5 : Commit**

```bash
git add src/use-cases/queries/ResoudreContexte.ts src/use-cases/queries/ResoudreContexte.test.ts
git commit -m "feat: add filtrerPourDepartement method to Contexte"
```

---

## Task 3 : Composant `SelecteurGouvernance`

**Files:**
- Create: `src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.tsx`
- Create: `src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx`

- [ ] **Step 1 : Écrire le test qui échoue**

```typescript
// src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx
import { render, screen } from '@testing-library/react'
import { select } from 'react-select-event'
import { describe, expect, it, vi } from 'vitest'

import SelecteurGouvernance from './SelecteurGouvernance'

const mockPush = vi.fn<(url: string) => void>()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn<() => object>().mockReturnValue({
    push: mockPush,
  }),
}))

const options = [
  { label: '(01) Ain', value: '01' },
  { label: '(75) Paris', value: '75' },
]

describe('SelecteurGouvernance', () => {
  it('affiche la gouvernance courante sélectionnée', () => {
    // GIVEN / WHEN
    render(
      <>
        <label htmlFor="gouvernance">Gouvernance</label>
        <SelecteurGouvernance
          codeDepartementActuel="01"
          options={options}
        />
      </>
    )

    // THEN
    const combobox = screen.getByRole('combobox', { name: 'Gouvernance' })
    expect(combobox).toBeInTheDocument()
    expect(screen.getByText('(01) Ain')).toBeInTheDocument()
  })

  it('navigue vers le tableau de bord de la gouvernance sélectionnée', async () => {
    // GIVEN
    render(
      <>
        <label htmlFor="gouvernance">Gouvernance</label>
        <SelecteurGouvernance
          codeDepartementActuel="01"
          options={options}
        />
      </>
    )

    // WHEN
    await select(screen.getByRole('combobox', { name: 'Gouvernance' }), '(75) Paris')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/tableau-de-bord/75')
  })
})
```

- [ ] **Step 2 : Lancer le test pour vérifier qu'il échoue**

```bash
yarn test src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx
```
Expected: FAIL — `Cannot find module './SelecteurGouvernance'`

- [ ] **Step 3 : Implémenter le composant**

```typescript
// src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.tsx
'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import Select, { StylesConfig } from 'react-select'

import { OptionGouvernance } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'

export default function SelecteurGouvernance({ codeDepartementActuel, options }: Props): ReactElement {
  const router = useRouter()
  const valeurActuelle = options.find((option) => option.value === codeDepartementActuel) ?? null

  return (
    <div className="fr-select-group">
      <Select
        components={{ DropdownIndicator }}
        inputId="gouvernance"
        instanceId="gouvernance"
        isClearable={false}
        name="gouvernance"
        onChange={(option) => {
          if (option) {
            router.push(`/tableau-de-bord/${option.value}`)
          }
        }}
        options={options as Array<OptionGouvernance>}
        placeholder="Sélectionnez une gouvernance"
        styles={styles}
        value={valeurActuelle}
      />
    </div>
  )
}

// istanbul ignore next @preserve
const styles: StylesConfig<OptionGouvernance> = {
  control: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (baseStyles, { isFocused, isSelected }) => {
    const colorOfFocus = isFocused ? '#dfdfdf' : undefined
    const backgroundColor = isSelected ? '#bbb' : colorOfFocus
    return {
      ...baseStyles,
      backgroundColor,
      color: '#222',
      cursor: 'pointer',
    }
  },
}

function DropdownIndicator(): ReactElement {
  return (
    <svg
      height="24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 13.1 5-4.9 1.4 1.4-6.4 6.3-6.4-6.4L7 8.1l5 5z" />
    </svg>
  )
}

type Props = Readonly<{
  codeDepartementActuel?: string
  options: ReadonlyArray<OptionGouvernance>
}>
```

- [ ] **Step 4 : Lancer le test pour vérifier qu'il passe**

```bash
yarn test src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx
```
Expected: PASS — 2 tests

- [ ] **Step 5 : Commit**

```bash
git add src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.tsx src/components/transverse/SelecteurGouvernance/SelecteurGouvernance.test.tsx
git commit -m "feat: add SelecteurGouvernance component"
```

---

## Task 4 : Modifier `/tableau-de-bord/page.tsx`

**Files:**
- Modify: `src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/page.tsx`

Ajouter le sélecteur en haut des blocs quand l'utilisateur a 2+ gouvernances.

- [ ] **Step 1 : Modifier le fichier**

Remplacer le contenu de `src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/page.tsx` par :

```typescript
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import BlocAccueil from './blocs/BlocAccueil'
import BlocBeneficiaires from './blocs/BlocBeneficiaires'
import BlocCartographie from './blocs/BlocCartographie'
import BlocDonneesStructure from './blocs/BlocDonneesStructure'
import BlocEtatDesLieux from './blocs/BlocEtatDesLieux'
import BlocFinancements from './blocs/BlocFinancements'
import BlocGouvernance from './blocs/BlocGouvernance'
import BlocMediateurs from './blocs/BlocMediateurs'
import BlocRejoindreGouvernance from './blocs/BlocRejoindreGouvernance'
import BlocSources from './blocs/BlocSources'
import { blocsParContexte, IdentifiantBloc } from './registreBlocs'
import SelecteurGouvernance from '@/components/transverse/SelecteurGouvernance/SelecteurGouvernance'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancesOptions } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'
import { Contexte, resoudreContexte } from '@/use-cases/queries/ResoudreContexte'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const blocs = blocsParContexte(contexte)
  const codesDepartements = contexte.codesDepartements()
  const options = gouvernancesOptions(codesDepartements)

  return (
    <>
      {codesDepartements.length >= 2 && (
        <SelecteurGouvernance options={options} />
      )}
      {blocs.map((bloc) => renderBloc(bloc, contexte, utilisateur))}
    </>
  )
}

function renderBloc(
  bloc: IdentifiantBloc,
  contexte: Contexte,
  utilisateur: UnUtilisateurReadModel
): ReactElement {
  const blocsRenderers: Record<IdentifiantBloc, () => ReactElement> = {
    accueil: () => (
      <BlocAccueil
        contexte={contexte}
        key="accueil"
        prenom={utilisateur.prenom}
      />),
    beneficiaires: () => (
      <BlocBeneficiaires
        contexte={contexte}
        key="beneficiaires"
      />),
    cartographie: () => <BlocCartographie key="cartographie" />,
    donneesStructure: () => (
      <BlocDonneesStructure
        contexte={contexte}
        key="donneesStructure"
      />),
    etatDesLieux: () => (
      <BlocEtatDesLieux
        contexte={contexte}
        key="etatDesLieux"
      />),
    financements: () => (
      <BlocFinancements
        contexte={contexte}
        key="financements"
      />),
    gouvernance: () => (
      <BlocGouvernance
        contexte={contexte}
        key="gouvernance"
      />),
    mediateurs: () => (
      <BlocMediateurs
        contexte={contexte}
        key="mediateurs"
      />),
    rejoindreGouvernance: () => <BlocRejoindreGouvernance key="rejoindreGouvernance" />,
    sources: () => <BlocSources key="sources" />,
  }

  return blocsRenderers[bloc]()
}
```

- [ ] **Step 2 : Vérifier typecheck et lint**

```bash
yarn typecheck && yarn lint:ts
```
Expected: 0 erreurs, 0 warnings

- [ ] **Step 3 : Commit**

```bash
git add "src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/page.tsx"
git commit -m "feat: add SelecteurGouvernance to /tableau-de-bord for multi-governance users"
```

---

## Task 5 : Nouvelle page `/tableau-de-bord/[codeDepartement]`

**Files:**
- Create: `src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/[codeDepartement]/page.tsx`

- [ ] **Step 1 : Créer le fichier**

```typescript
// src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/[codeDepartement]/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import BlocAccueil from '../blocs/BlocAccueil'
import BlocBeneficiaires from '../blocs/BlocBeneficiaires'
import BlocCartographie from '../blocs/BlocCartographie'
import BlocDonneesStructure from '../blocs/BlocDonneesStructure'
import BlocEtatDesLieux from '../blocs/BlocEtatDesLieux'
import BlocFinancements from '../blocs/BlocFinancements'
import BlocGouvernance from '../blocs/BlocGouvernance'
import BlocMediateurs from '../blocs/BlocMediateurs'
import BlocRejoindreGouvernance from '../blocs/BlocRejoindreGouvernance'
import BlocSources from '../blocs/BlocSources'
import { blocsParContexte, IdentifiantBloc } from '../registreBlocs'
import SelecteurGouvernance from '@/components/transverse/SelecteurGouvernance/SelecteurGouvernance'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancesOptions } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'
import { Contexte, resoudreContexte } from '@/use-cases/queries/ResoudreContexte'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordGouvernanceController({
  params,
}: Props): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const { codeDepartement } = await params

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()

  if (!codesDepartements.includes(codeDepartement)) {
    redirect('/tableau-de-bord')
  }

  const contexteFiltré = contexte.filtrerPourDepartement(codeDepartement)
  const blocs = blocsParContexte(contexteFiltré)
  const options = gouvernancesOptions(codesDepartements)

  return (
    <>
      {codesDepartements.length >= 2 && (
        <SelecteurGouvernance
          codeDepartementActuel={codeDepartement}
          options={options}
        />
      )}
      {blocs.map((bloc) => renderBloc(bloc, contexteFiltré, utilisateur))}
    </>
  )
}

function renderBloc(
  bloc: IdentifiantBloc,
  contexte: Contexte,
  utilisateur: UnUtilisateurReadModel
): ReactElement {
  const blocsRenderers: Record<IdentifiantBloc, () => ReactElement> = {
    accueil: () => (
      <BlocAccueil
        contexte={contexte}
        key="accueil"
        prenom={utilisateur.prenom}
      />),
    beneficiaires: () => (
      <BlocBeneficiaires
        contexte={contexte}
        key="beneficiaires"
      />),
    cartographie: () => <BlocCartographie key="cartographie" />,
    donneesStructure: () => (
      <BlocDonneesStructure
        contexte={contexte}
        key="donneesStructure"
      />),
    etatDesLieux: () => (
      <BlocEtatDesLieux
        contexte={contexte}
        key="etatDesLieux"
      />),
    financements: () => (
      <BlocFinancements
        contexte={contexte}
        key="financements"
      />),
    gouvernance: () => (
      <BlocGouvernance
        contexte={contexte}
        key="gouvernance"
      />),
    mediateurs: () => (
      <BlocMediateurs
        contexte={contexte}
        key="mediateurs"
      />),
    rejoindreGouvernance: () => <BlocRejoindreGouvernance key="rejoindreGouvernance" />,
    sources: () => <BlocSources key="sources" />,
  }

  return blocsRenderers[bloc]()
}

type Props = Readonly<{
  params: Promise<Readonly<{ codeDepartement: string }>>
}>
```

- [ ] **Step 2 : Vérifier typecheck et lint**

```bash
yarn typecheck && yarn lint:ts
```
Expected: 0 erreurs, 0 warnings

- [ ] **Step 3 : Lancer tous les tests**

```bash
yarn test
```
Expected: tous les tests passent

- [ ] **Step 4 : Commit**

```bash
git add "src/app/(connecte)/(avec-menu)/(default)/tableau-de-bord/[codeDepartement]/page.tsx"
git commit -m "feat: add /tableau-de-bord/[codeDepartement] page with governance selector"
```

---

## Vérification finale

- [ ] **Lancer le check complet**

```bash
yarn check
```
Expected: 0 erreurs, 0 warnings, coverage ≥ 90%
