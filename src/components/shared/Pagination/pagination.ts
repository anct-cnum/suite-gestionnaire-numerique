
import config from '@/use-cases/config.json'

export function nombreDePage(nombreDeResultat: number): number {
  const utilisateursParPage = config.nombreDUtilisateurParPage

  return Math.trunc(nombreDeResultat / utilisateursParPage + 1)
}

export function pages(
  nombreDeResultat: number,
  pageCourante: number
): Array<number> {
  const nombreDePages = nombreDePage(nombreDeResultat)

  return new Array(nombreDePages)
    .fill('')
    .map((_, index): number => index + 1)
    .filter((page): boolean => {
      const debutDePagination = pageCourante < 3
      const finDePagination = pageCourante > nombreDePages - 4

      if (debutDePagination) {
        return page === 1
          || page === 2
          || page === 3
          || page === 4
          || page === 5
      }

      if (finDePagination) {
        return page === nombreDePages - 4
          || page === nombreDePages - 3
          || page === nombreDePages - 2
          || page === nombreDePages - 1
          || page === nombreDePages
      }

      return pageCourante === page - 1
        || pageCourante - 1 === page - 1
        || pageCourante - 2 === page - 1
        || pageCourante + 1 === page - 1
        || pageCourante + 2 === page - 1
    })
}

export function fullUrl(url: string, searchParams: URLSearchParams): URL {
  const urlAvecParametres = new URL(url, process.env.NEXT_PUBLIC_HOST)

  searchParams.forEach((value, name) => {
    urlAvecParametres.searchParams.append(name, value)
  })

  return urlAvecParametres
}
