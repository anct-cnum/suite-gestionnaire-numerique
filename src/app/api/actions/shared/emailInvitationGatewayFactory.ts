import { NodemailerEmailInvitationGateway } from '@/gateways/NodemailerEmailInvitationGateway'
import { EmailGateway } from '@/use-cases/commands/shared/EmailGateway'

const {
  SMTP_HOST,
  SMTP_SUPER_ADMIN_HOST,
  SMTP_PORT,
  SMTP_SUPER_ADMIN_PORT,
  SMTP_USER,
  SMTP_SUPER_ADMIN_USER,
  SMTP_PASSWORD,
  SMTP_SUPER_ADMIN_PASSWORD,
  NEXT_PUBLIC_HOST,
} = process.env as NodeJS.Process['env'] & Readonly<{
    SMTP_HOST: string,
    SMTP_SUPER_ADMIN_HOST: string,
    SMTP_PORT: string,
    SMTP_SUPER_ADMIN_PORT: string,
    SMTP_USER: string,
    SMTP_SUPER_ADMIN_USER: string,
    SMTP_PASSWORD: string,
    SMTP_SUPER_ADMIN_PASSWORD: string,
    NEXT_PUBLIC_HOST: string,
  }>

export function emailInvitationGatewayFactory(isSuperAdmin: boolean): EmailGateway {
  return isSuperAdmin
    ? new NodemailerEmailInvitationGateway(
      SMTP_SUPER_ADMIN_HOST,
      SMTP_SUPER_ADMIN_PORT,
      NEXT_PUBLIC_HOST,
      SMTP_SUPER_ADMIN_USER,
      SMTP_SUPER_ADMIN_PASSWORD
    )
    : new NodemailerEmailInvitationGateway(
      SMTP_HOST,
      SMTP_PORT,
      NEXT_PUBLIC_HOST,
      SMTP_USER,
      SMTP_PASSWORD
    )
}
