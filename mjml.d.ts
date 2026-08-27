// mjml 5 ne publie pas de types et @types/mjml (v4) décrit l'ancienne API synchrone
declare module 'mjml' {
  export default function mjml2html(input: string): Promise<Readonly<{ html: string }>>
}
