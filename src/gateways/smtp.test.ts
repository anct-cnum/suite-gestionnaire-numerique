import nodemailer from 'nodemailer'

describe('smtp', () => {
  it('test temporaire', async () => {
    const transporter = nodemailer.createTransport({
      // @ts-expect-error
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      ...(process.env.SMTP_USER !== ''
        ? {
          auth: {
            pass: process.env.SMTP_PASSWORD,
            user: process.env.SMTP_USER,
          },
        }
        : {}
      ),
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      html: '<b>Hello world?</b>',
      subject: 'Hello ✔',
      text: 'Hello world?',
      to: 'bar@example.com, baz@example.com',
    })
  })
})
