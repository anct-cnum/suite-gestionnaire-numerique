# Sélecteur multi-gouvernance — Dashboard

**Date** : 2026-04-01
**Source** : CR Gestion multi-gouvernance & dashboard (01/04/2026)

---

## Objectif

Permettre à un utilisateur appartenant à plusieurs gouvernances de naviguer entre leurs dashboards via un sélecteur, sans page intermédiaire.

---

## Routing

### Pages existantes (inchangées)
- `/tableau-de-bord` — dashboard existant, aucune modification de logique

### Nouvelle page
- `/tableau-de-bord/[codeDepartement]` — dashboard gouvernance-spécifique

### Règles de navigation
- Le sélecteur est affiché sur **les deux pages** (`/tableau-de-bord` et `/tableau-de-bord/[codeDepartement]`), uniquement si l'utilisateur a 2+ gouvernances
- Sélectionner une gouvernance navigue vers `/tableau-de-bord/[codeDepartement]` correspondant
- Sécurisation serveur sur `/tableau-de-bord/[codeDepartement]` : si le `codeDepartement` n'est pas dans les scopes de l'utilisateur → redirect `/tableau-de-bord`

---

## Composant `SelecteurGouvernance`

- Composant `'use client'` basé sur `react-select`, calqué sur `SelecteurZoneGeographique`
- Options : liste des gouvernances accessibles à l'utilisateur (label = nom du département, value = codeDepartement)
- `onChange` → navigation via `useRouter` vers `/tableau-de-bord/[codeDepartement]`
- Styles DSFR cohérents avec `SelecteurZoneGeographique`

---

## Données

- La liste des gouvernances accessibles est dérivée du `Contexte` existant via `codesDepartements()`
- Aucun nouveau use case nécessaire
- Le presenter du dashboard transforme les codes en options `{ label, value }` pour le sélecteur
- Le controller server-side de `/tableau-de-bord/[codeDepartement]` :
  1. Résout le contexte (`resoudreContexte()`)
  2. Vérifie que `codeDepartement` est dans `codesDepartements()` → sinon redirect
  3. Charge les blocs du dashboard pour la gouvernance sélectionnée
  4. Passe les options au `SelecteurGouvernance`

---

## Règles métier (CR)

| Profil | Dashboard |
|---|---|
| Département | `/tableau-de-bord/[codeDepartement]` |
| Structure sans gouvernance | `/tableau-de-bord` (inchangé) |
| Membre / Coporteur (1 gouvernance) | `/tableau-de-bord/[codeDepartement]` |
| Multi-gouvernance | `/tableau-de-bord/[1ère gouvernance]` par défaut, sélecteur pour switcher |
| Admin | Pas de sélecteur (vue nationale) |

- Membre = Coporteur = Département → même dashboard
- Accès interdit aux dashboards des gouvernances dont l'utilisateur n'est pas membre

---

## Ce qui n'est PAS dans le périmètre

- Modification de la logique des blocs existants
- Modification du menu latéral
- Vue combinée multi-gouvernances
