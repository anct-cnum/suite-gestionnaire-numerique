// altcha-lib 2 ne déclare ses types que dans le champ « exports » de son package.json, que la résolution
// « node » de tsconfig.json ne lit pas : on les relie ici à ses fichiers de types
declare module 'altcha-lib/algorithms/sha' {
  export * from 'altcha-lib/dist/esm/v2/algorithms/sha'
}

declare module 'altcha-lib' {
  export * from 'altcha-lib/dist/esm/v2/index'
}
