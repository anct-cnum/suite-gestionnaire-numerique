declare global {
  interface Window {
    dsfr: (element: HTMLElement | null) => {
      modal: {
        conceal: () => void
      }
    }
  }
}

export default global
