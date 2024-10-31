import { Profile } from '@/gateways/ProConnectAuthentificationGateway'

export function profileFactory(override?: Partial<Profile>): { user: Profile } {
  return {
    user: {
      aud: '',
      email: '',
      exp: 0,
      given_name: '',
      iat: 0,
      id: '',
      idp_id: '',
      iss: '',
      phone_number: '',
      siret: '',
      sub: '',
      usual_name: '',
      ...override,
    },
  }
}
