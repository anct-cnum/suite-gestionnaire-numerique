/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NodemailerEmailInvitationGateway } from '@/gateways/NodemailerEmailInvitationGateway'
import { EmailGateway } from '@/use-cases/commands/shared/EmailGateway'

export function emailInvitationGatewayFactory(isSuperAdmin: boolean): EmailGateway {
  return isSuperAdmin // NOSONAR
    ? new NodemailerEmailInvitationGateway(
      process.env.SMTP_SUPER_ADMIN_HOST!,
      process.env.SMTP_SUPER_ADMIN_PORT!,
      process.env.NEXT_PUBLIC_HOST!,
      process.env.SMTP_SUPER_ADMIN_USER,
      process.env.SMTP_SUPER_ADMIN_PASSWORD
    ) : new NodemailerEmailInvitationGateway(
      process.env.SMTP_HOST!,
      process.env.SMTP_PORT!,
      process.env.NEXT_PUBLIC_HOST!,
      process.env.SMTP_USER,
      process.env.SMTP_PASSWORD
    )
}
