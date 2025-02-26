// Stryker disable all
import NextAuth, { getServerSession, NextAuthOptions, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { OAuthConfig } from 'next-auth/providers'
import { ClientSafeProvider } from 'next-auth/react'

import { PrismaUtilisateurLoader } from './PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from './PrismaUtilisateurRepository'
import prisma from '../../prisma/prismaClient'
import { CorrigerNomPrenomSiAbsents } from '@/use-cases/commands/CorrigerNomPrenomSiAbsents'
import { MettreAJourDateDeDerniereConnexion } from '@/use-cases/commands/MettreAJourDateDeDerniereConnexion'
import { MettreAJourUidALaPremiereConnexion } from '@/use-cases/commands/MettreAJourUidALaPremiereConnexion'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

const providerId = 'pro-connect'
const providerName = 'Pro Connect'
const providerScope = 'openid given_name usual_name siret phone email'
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
    async signIn({ profile }): Promise<boolean> {
      if (profile?.sub !== undefined && profile.email !== undefined) {
        const utilisateurRepository = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
        const utilisateurLoader = new PrismaUtilisateurLoader()
        const utilisateurReadModel = await recupereretMettreAJourUtilisateur(
          profile as Profile,
          utilisateurLoader,
          utilisateurRepository
        )
        if (!utilisateurReadModel) {
          return false
        }
        await corrigerNomPrenomUtilisateur(
          utilisateurReadModel,
          profile as Profile,
          utilisateurRepository
        )
        await mettreAJourDateConnexion(
          profile.sub,
          utilisateurRepository
        )
      }
      return true
    },
  },
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    error: '/auth/error',
  },
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

export async function getSessionSub(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return (await getSession())!.user.sub
}

export type ProConnectProvider = Readonly<Record<'pro-connect', ClientSafeProvider>>

export type Profile = Readonly<{
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

async function recupereretMettreAJourUtilisateur(
  profile: Profile,
  utilisateurLoader: PrismaUtilisateurLoader,
  utilisateurRepository: PrismaUtilisateurRepository
): Promise<UnUtilisateurReadModel | null> {
  let utilisateurReadModel = null
  try {
    utilisateurReadModel = await utilisateurLoader.findByUid(profile.sub)
  } catch (error) {
    if (error instanceof Error && error.message === 'Utilisateur non trouvé') {
      try {
        await new MettreAJourUidALaPremiereConnexion(utilisateurRepository)
          .handle({
            emailAsUid: profile.email,
            uid: profile.sub,
          })
      } catch {
        return null
      }
    }
    utilisateurReadModel = await utilisateurLoader.findByUid(profile.sub)
  }
  return utilisateurReadModel
}

async function corrigerNomPrenomUtilisateur(
  utilisateurReadModel: UnUtilisateurReadModel,
  profile: Profile,
  utilisateurRepository: PrismaUtilisateurRepository
): Promise<string> {
  return new CorrigerNomPrenomSiAbsents(utilisateurRepository)
    .handle({
      actuels: {
        nom: utilisateurReadModel.nom,
        prenom: utilisateurReadModel.prenom,
      },
      corriges: {
        nom: profile.usual_name,
        prenom: profile.given_name,
      },
      uidUtilisateurCourant: profile.sub,
    })
}

async function mettreAJourDateConnexion(
  uid: string,
  utilisateurRepository: PrismaUtilisateurRepository
): Promise<string> {
  // eslint-disable-next-line no-restricted-syntax
  return new MettreAJourDateDeDerniereConnexion(utilisateurRepository, new Date()).handle({
    uidUtilisateurCourant: uid,
  })
}
