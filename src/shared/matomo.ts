// Plan de marquage : la file _paq est déclarée par le script Matomo
// (public/matomo-v1.js), chargé uniquement en production — no-op sinon.
// Aucune donnée personnelle ne doit être transmise.
export function suivreEvenement(categorie: string, action: string, nom?: string): void {
  const matomo = (globalThis as Readonly<{ _paq?: { push(evenement: ReadonlyArray<string>): void } }>)._paq
  matomo?.push(nom === undefined ? ['trackEvent', categorie, action] : ['trackEvent', categorie, action, nom])
}
