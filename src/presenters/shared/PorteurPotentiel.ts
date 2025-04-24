import { RoleViewModel } from "./role"

export type  PorteurPotentielViewModel = Readonly<{
    id:string
    link: string
    nom: string
    roles: Array<RoleViewModel>
  }>
  