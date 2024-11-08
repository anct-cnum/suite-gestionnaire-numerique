import nodemailer, { Transporter } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const {
  SMTP_HOST,
  SMTP_TEST_ACCOUNT_HOST,
  SMTP_PORT,
  SMTP_TEST_ACCOUNT_PORT,
  SMTP_USER,
  SMTP_TEST_ACCOUNT_USER,
  SMTP_PASSWORD,
  SMTP_TEST_ACCOUNT_PASSWORD,
} = process.env

export const mailSender = sender({
  host: SMTP_HOST,
  pass: SMTP_PASSWORD,
  port: SMTP_PORT,
  user: SMTP_USER,
})

export const mailTestAccountSender = sender({
  host: SMTP_TEST_ACCOUNT_HOST,
  pass: SMTP_TEST_ACCOUNT_PASSWORD,
  port: SMTP_TEST_ACCOUNT_PORT,
  user: SMTP_TEST_ACCOUNT_USER,
})

function sender({
  host,
  port,
  user,
  pass,
}: MailSendingParams): Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options> {
  const authParams = process.env.SMTP_USER !== '' ? { auth: { pass, user } } : {}
  // @ts-expect-error
  return nodemailer.createTransport({
    // @ts-expect-error
    host,
    port,
    secure: false,
    ...authParams,
  })
}
type MailSendingParams = Partial<
  Readonly<{
    host: string
    port: string
    user: string
    pass: string
  }>
>
