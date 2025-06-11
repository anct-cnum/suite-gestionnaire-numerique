import { Destinataire } from '@/gateways/emails/invitationEmail'

export interface EmailGateway {
  send(destinataire: Destinataire): Promise<void>
}

export type EmailGatewayFactory = (isSuperAdmin: boolean) => EmailGateway
