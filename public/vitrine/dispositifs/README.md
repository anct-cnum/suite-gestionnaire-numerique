# Assets manquants pour la page Dispositifs

## Illustrations à télécharger depuis Figma

Pour obtenir les bonnes illustrations avec les couleurs spécifiques (rose et jaune), suivez ces étapes :

### 1. Illustration Conseiller numérique (fond rose/violet)

**Lien Figma :** https://www.figma.com/design/IFH80doDOEvJvbMlUnQIOC/%E2%AD%90%EF%B8%8F-Outil-gestionnaire-FNE?node-id=15095:93665

**Étapes :**
1. Ouvrir le lien dans Figma
2. Sélectionner l'illustration (fond rose avec graphiques)
3. Clic droit → "Export" → Choisir "PNG" à 2x
4. Télécharger et sauvegarder sous : `/public/vitrine/dispositifs/illustration-conseiller.png`

**Node ID :** `15095:93665`

---

### 2. Illustration Aidants Connect (fond jaune)

**Lien Figma :** https://www.figma.com/design/IFH80doDOEvJvbMlUnQIOC/%E2%AD%90%EF%B8%8F-Outil-gestionnaire-FNE?node-id=14913:87551

**Étapes :**
1. Ouvrir le lien dans Figma
2. Sélectionner l'illustration (fond jaune avec graphiques)
3. Clic droit → "Export" → Choisir "PNG" à 2x
4. Télécharger et sauvegarder sous : `/public/vitrine/dispositifs/illustration-aidants-connect.png`

**Node ID :** `14913:87551`

---

## Mise à jour du code après téléchargement

Une fois les images téléchargées, mettez à jour les chemins dans `/src/app/vitrine/dispositifs/page.tsx` :

**Ligne ~105 :**
```tsx
src="/vitrine/dispositifs/illustration-conseiller.png"
```

**Ligne ~131 :**
```tsx
src="/vitrine/dispositifs/illustration-aidants-connect.png"
```

---

## Assets déjà en place

✅ Logo Conseiller numérique : `/public/vitrine/accueil/logo-conseillers-numeriques.svg`
✅ Logo Aidants Connect : `/public/vitrine/accueil/logo-aidants-connect.svg`
✅ Logo RF + ANCT : `/public/vitrine/accueil/logo-rf-anct.svg`
