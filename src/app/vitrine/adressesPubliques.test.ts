import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('adresses de la vitrine', () => {
  it('aucun lien, redirection ou navigation ne vise le préfixe technique /vitrine, qui apparaîtrait dans la barre d’adresse', () => {
    // GIVEN
    const dossiers = [
      join('src', 'app', 'vitrine'),
      join('src', 'components', 'vitrine'),
      join('src', 'components', 'transverse'),
      join('src', 'presenters'),
    ]

    // WHEN
    const adressesPrefixees = dossiers.flatMap((dossier) =>
      readdirSync(join(process.cwd(), dossier), { recursive: true })
        .map(String)
        .filter((fichier) => /\.tsx?$/.test(fichier) && !/\.test\.tsx?$/.test(fichier))
        .filter((fichier) => !fichier.endsWith('etatCourant.ts'))
        .flatMap((fichier) => {
          const source = readFileSync(join(process.cwd(), dossier, fichier), 'utf8')
          // Une chaîne qui commence par /vitrine et ne désigne pas un fichier statique (image, document…)
          return [...source.matchAll(/['"`](\/vitrine(?:\/[^'"`\s]*)?)['"`]/g)]
            .map(([, adresse]) => adresse)
            .filter((adresse) => !/\.[a-z0-9]+$/i.test(adresse))
            .map((adresse) => `${join(dossier, fichier)} : ${adresse}`)
        })
    )

    // THEN
    expect(adressesPrefixees).toStrictEqual([])
  })
})
