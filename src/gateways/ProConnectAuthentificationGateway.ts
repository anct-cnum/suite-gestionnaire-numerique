import NextAuth, { getServerSession, NextAuthOptions, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { OAuthConfig } from 'next-auth/providers'
import { ClientSafeProvider } from 'next-auth/react'

const providerId = 'pro-connect'
const providerName = 'Pro Connect'
const providerScope = 'openid given_name usual_name siret phone'
const nextAuthOptions = {
  callbacks: {
    jwt({ token, profile }): JWT {
      if (profile) {
        return {
          ...token,
          user: profile,
        }
      }

      return token
    },
    session({ session, token }): Session {
      return {
        ...session,
        // @ts-expect-error
        user: token.user,
      }
    },
  },
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    {
      authorization: {
        params: { scope: providerScope },
      },
      clientId: process.env.PRO_CONNECT_CLIENT_ID,
      clientSecret: process.env.PRO_CONNECT_CLIENT_SECRET,
      id: providerId,
      idToken: true,
      name: providerName,
      profile(profile: Omit<Profile, 'id'>): Profile {
        return {
          id: profile.sub,
          ...profile,
        }
      },
      type: 'oauth',
      // userinfo: `${process.env.PRO_CONNECT_URL}/userinfo`,
      userinfo: {
        async request(context): Promise<Profile> {
          function decodeJwt(token: string): Profile {
            return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as Profile
          }

          const response = await fetch(`${process.env.PRO_CONNECT_URL}/userinfo`, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          })

          return decodeJwt(await response.text())
        },
      },
      wellKnown: `${process.env.PRO_CONNECT_URL}/.well-known/openid-configuration`,
    } satisfies OAuthConfig<Profile>,
  ],
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const handler = NextAuth(nextAuthOptions)

export async function getSession(): Promise<{ user: Profile } | null> {
  return getServerSession(nextAuthOptions)
}

export type ProConnectProvider = Readonly<Record<'pro-connect', ClientSafeProvider>>

type Profile = Readonly<{
  id: string
  sub: string
  email: string
  given_name: string
  usual_name: string
  siret: string
  phone_number: string
  idp_id: string
  aud: string
  exp: number
  iat: number
  iss: string
}>
