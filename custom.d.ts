declare global {
  interface Window {
    dsfr: (element: HTMLElement | null) => {
      modal: {
        conceal: () => void
      }
    }
  }

  namespace PrismaJson {
    interface Contact {
      email: string
      fonction: string
      nom: string
      prenom: string
      telephone: string
    }
    interface Adresse {
      code_postal: string
      indice_repetition_voie: string
      libelle_commune: string
      libelle_voie: string
      numero_voie: string
      type_voie: string
    }
  }
}

export default global
