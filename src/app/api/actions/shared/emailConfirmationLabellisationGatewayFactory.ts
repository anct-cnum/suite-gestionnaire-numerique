/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NodemailerEmailConfirmationLabellisationGateway } from '@/gateways/NodemailerEmailConfirmationLabellisationGateway'
import { EmailConfirmationLabellisationGateway } from '@/use-cases/commands/AttesterLabellisationStructure'

export function emailConfirmationLabellisationGatewayFactory(): EmailConfirmationLabellisationGateway {
  return new NodemailerEmailConfirmationLabellisationGateway(
    process.env.SMTP_HOST!,
    process.env.SMTP_PORT!,
    process.env.NEXT_PUBLIC_HOST!,
    process.env.SMTP_USER,
    process.env.SMTP_PASSWORD
  )
}
