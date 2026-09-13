---
name: dsfr-ui
description: Règles UI de min — DSFR obligatoire et complet, formulaires, Select/SelectAsync, Drawer/Modal, notifications, Storybook. Use when creating or modifying a React component in src/components/, a *.module.css file, a Storybook story, or any visual rendering.
user-invocable: false
---

# Composants et UI

## Design system — DSFR OBLIGATOIRE

- **Le DSFR (Système de Design de l'État, `@gouvfr/dsfr`) est IMPÉRATIF pour TOUT aspect visuel, sans exception.** Toute UI qui ne respecte pas le DSFR est un bug (cf. retour de recette #1251).
- Avant de créer ou styler un composant, chercher d'abord le composant ou la classe DSFR existante : https://www.systeme-de-design.gouv.fr/composants-et-modeles
- **RESPECTER LE DSFR EN ENTIER, DANS TOUS LES CAS — pas juste ses classes.** Chaque composant s'utilise avec sa structure HTML canonique COMPLÈTE telle que documentée (markup, ids, attributs aria, panels, JS DSFR). Un rendu incorrect = structure incomplète : la compléter. Ne JAMAIS corriger, ajuster ou « améliorer » un rendu par du CSS custom, quel que soit le cas (cf. #1835)
- Classes DSFR uniquement : composants (`fr-btn`, `fr-select`, `fr-input`, `fr-card`, `fr-badge`, `fr-table`, `fr-modal`…) et utilitaires (`fr-grid-row`, `fr-col-*`, `fr-mb-2w`, `fr-text--sm`…)
- Couleurs, espacements, typographie : exclusivement via les variables CSS DSFR (`var(--background-contrast-grey)`, `var(--text-default-grey)`, `var(--border-plain-grey)`…) — **jamais de valeurs en dur** (hex, px arbitraires, couleurs nommées)
- CSS custom (modules `*.module.css`) : uniquement en dernier recours pour ce que le DSFR ne couvre pas (ex. animation du Drawer), et toujours construit sur les variables DSFR
- Si un composant externe est indispensable (ex. react-select pour les selects avec recherche), le surcharger avec les variables CSS DSFR pour un rendu strictement identique au DSFR — voir `src/components/shared/Select/styles.tsx` comme référence
- Dark mode : respecté automatiquement si et seulement si les variables CSS DSFR sont utilisées — une couleur en dur casse le dark mode
- Exception : `src/components/coop/**` (code importé, hors périmètre DSFR)

## Forms

- Formulaires non contrôlés avec `FormEvent` et `FormData`
- `useId()` pour les associations label/input
- Patterns de validation : `pattern={emailPattern.source}` depuis `src/shared/patterns.ts`
- Validation serveur via Zod dans les server actions

## Selects

- Standard unique : `Select` et `SelectAsync` (`src/components/shared/Select/`), wrappers react-select stylés DSFR (décision PO #1251)
- Interdit par ESLint : `<select>` natif et import direct de `react-select` / `react-select/async` (exception : `src/components/coop/**`)
- Label passé en children (utiliser `fr-sr-only` si le label doit être invisible)
- `name` pour la soumission FormData (react-select rend un input caché), `required` supporté
- Non contrôlé : marquer l'option par défaut avec `isSelected` ; contrôlé : prop `value` scalaire (`option.value`)
- En test : `await userEvent.click(screen.getByRole('combobox', { name: 'X' }))` puis `await userEvent.click(await screen.findByRole('option', { name: 'Y' }))` ; un select désactivé perd le rôle combobox (utiliser `getByLabelText`)

## Drawer / Modal

- `Modal` (`src/components/shared/Modal/`) et `Drawer` (`src/components/shared/Drawer/`) basés sur `<dialog>` et classes DSFR (`fr-modal`)
- Attributs aria obligatoires : `aria-labelledby={labelId}` sur le `<dialog>`, `aria-controls={id}` sur le bouton fermer, `aria-modal="true"` sur Modal
- Props `id` et `labelId` pour lier le dialog à son titre
- État ouvert/fermé géré par `useState` dans le parent
- Animation CSS slide-in/out pour le Drawer

## Notifications

- react-toastify stylé avec les variables CSS DSFR

## Storybook

- Meta avec `title: 'Components/Feature/NomComposant'`
- Import depuis `@storybook/nextjs-vite`
- Args depuis les factories de test data
- Variantes nommées en PascalCase : `Default`, `SansInformations`, `PlusieursContacts`
