export function nombreDePage(nombreDeResultat: number, utilisateursParPage: number): number {
  return Math.trunc(nombreDeResultat / utilisateursParPage + 1)
}

export function pages(
  nombreDeResultat: number,
  pageCourante: number,
  utilisateursParPage: number
): Array<number> {
  const nombreDePages = nombreDePage(nombreDeResultat, utilisateursParPage)

  return Array
    .from({ length: nombreDePages }, (_, index) => index + 1)
    .filter((page): boolean => {
      const isDebutDePagination = pageCourante < 3
      const isFinDePagination = pageCourante > nombreDePages - 4

      if (isDebutDePagination) {
        return page < 6
      }

      if (isFinDePagination) {
        return page >= nombreDePages - 4
      }

      return page >= pageCourante - 1 && page <= pageCourante + 3
    })
}

export function fullUrl(url: string, searchParams: URLSearchParams): URL {
  const urlAvecParametres = new URL(url, process.env.NEXT_PUBLIC_HOST)

  searchParams.forEach((value, name) => {
    urlAvecParametres.searchParams.append(name, value)
  })

  return urlAvecParametres
}
