declare global {
  interface Window {
    dsfr(element: HTMLElement | null): {
      modal: {
        conceal(): void
      }
    }
  }

  namespace PrismaJson {
    type Contact = Readonly<{
      email: string
      fonction: string
      nom: string
      prenom: string
      telephone: string
    }>

    type NotePrivee = Readonly<{
      contenu: string
      derniereEdition: string
    }>
  }
}

export default global
