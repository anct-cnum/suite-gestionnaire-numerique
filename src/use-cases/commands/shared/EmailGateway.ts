export interface EmailGateway {
  send(destinataire: string): Promise<void>
}

export type EmailGatewayFactory = (isSuperAdmin: boolean) => EmailGateway
