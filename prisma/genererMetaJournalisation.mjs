// Prisma 7 a supprimé Prisma.dmmf du client généré : la méta nécessaire à l'extension de
// journalisation (clés primaires, mapping colonne, schéma.table) est précalculée ici depuis le
// DMMF complet, au moment de `pnpm prisma:generate` (voir package.json).
import internals from '@prisma/internals'
import fs from 'node:fs'

const { getDMMF } = internals

const schemaUrl = new URL('schema.prisma', import.meta.url)
const dmmf = await getDMMF({ datamodel: fs.readFileSync(schemaUrl, 'utf8') })

const meta = Object.fromEntries(
  dmmf.datamodel.models.map((modele) => [
    modele.name,
    {
      champsCles: modele.primaryKey?.fields ?? modele.fields.filter((champ) => champ.isId).map((champ) => champ.name),
      colonneParChamp: Object.fromEntries(
        modele.fields
          .filter((champ) => champ.kind !== 'object')
          .map((champ) => [champ.name, champ.dbName ?? champ.name])
      ),
      delegue: modele.name.charAt(0).toLowerCase() + modele.name.slice(1),
      sourceKey: `${modele.schema ?? 'public'}.${modele.dbName ?? modele.name}`,
    },
  ])
)

fs.writeFileSync(new URL('generated/journalisationMeta.json', import.meta.url), `${JSON.stringify(meta, null, 2)}\n`)
console.log(`✔ Méta de journalisation générée pour ${Object.keys(meta).length} modèles`)
