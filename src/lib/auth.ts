import { getServerSession, type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { queryOne } from "@/lib/db";
import { isAdminAccount } from "@/lib/auth-routing";
import type { Profile, UserRole } from "@/types";
import type { OAuthConfig } from "next-auth/providers/oauth";

interface EntraProfile extends Record<string, unknown> {
  sub?: string;
  oid?: string;
  iss?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  emails?: string[];
}

export interface AppUser {
  id: string;
  externalSubject: string;
  externalIssuer: string;
  email: string | null;
  name: string | null;
  role: UserRole;
}

interface ProfileRow extends Profile {
  external_subject: string;
  external_issuer: string;
}

function getWellKnownUrl(issuer: string): string {
  const normalized = issuer.replace(/\/$/, "");
  return normalized.includes(".well-known/openid-configuration")
    ? normalized
    : `${normalized}/.well-known/openid-configuration`;
}

function profileEmail(profile: EntraProfile): string | null {
  return (
    profile.email ??
    profile.preferred_username ??
    profile.emails?.[0] ??
    null
  );
}

function externalSubject(profile: EntraProfile): string {
  return profile.oid ?? profile.sub ?? "";
}

async function upsertProfileFromToken(input: {
  externalSubject: string;
  externalIssuer: string;
  email: string | null;
  name: string | null;
}): Promise<ProfileRow> {
  const adminRole: UserRole = isAdminAccount(null, input.email) ? "admin" : "user";

  const profile = await queryOne<ProfileRow>(
    `
      INSERT INTO profiles (
        external_subject,
        external_issuer,
        email,
        full_name,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (external_subject, external_issuer)
      DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        role = CASE
          WHEN lower(COALESCE(EXCLUDED.email, '')) = lower('time45120@gmail.com')
          THEN 'admin'
          ELSE profiles.role
        END,
        updated_at = NOW()
      RETURNING *
    `,
    [
      input.externalSubject,
      input.externalIssuer,
      input.email,
      input.name,
      adminRole,
    ]
  );

  if (!profile) {
    throw new Error("Profile upsert failed");
  }

  return profile;
}

function applyProfileToToken(token: JWT, profile: ProfileRow): JWT {
  token.appUserId = profile.id;
  token.role = profile.role;
  token.externalSubject = profile.external_subject;
  token.externalIssuer = profile.external_issuer;
  return token;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: getAuthProviders(),
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const entraProfile = profile as EntraProfile;
        const subject = externalSubject(entraProfile);
        const issuer =
          entraProfile.iss ?? process.env.ENTRA_EXTERNAL_ID_ISSUER ?? "";

        if (subject && issuer) {
          const dbProfile = await upsertProfileFromToken({
            externalSubject: subject,
            externalIssuer: issuer,
            email: profileEmail(entraProfile),
            name: entraProfile.name ?? token.name ?? null,
          });
          return applyProfileToToken(token, dbProfile);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.appUserId ?? "");
        session.user.role = (token.role as UserRole | undefined) ?? "user";
        session.user.externalSubject = String(token.externalSubject ?? "");
        session.user.externalIssuer = String(token.externalIssuer ?? "");
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

function getAuthProviders(): OAuthConfig<EntraProfile>[] {
  const issuer = process.env.ENTRA_EXTERNAL_ID_ISSUER;
  const clientId = process.env.ENTRA_EXTERNAL_ID_CLIENT_ID;
  const clientSecret = process.env.ENTRA_EXTERNAL_ID_CLIENT_SECRET;

  if (!issuer || !clientId || !clientSecret) {
    return [];
  }

  return [
    {
      id: "entra-external-id",
      name: "Microsoft Entra External ID",
      type: "oauth",
      wellKnown: getWellKnownUrl(issuer),
      clientId,
      clientSecret,
      authorization: {
        params: {
          scope: "openid profile email offline_access",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile: EntraProfile) {
        const subject = externalSubject(profile);
        return {
          id: subject,
          name: profile.name ?? null,
          email: profileEmail(profile),
        };
      },
    },
  ];
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    externalSubject: session.user.externalSubject,
    externalIssuer: session.user.externalIssuer,
    email: session.user.email ?? null,
    name: session.user.name ?? null,
    role: session.user.role,
  };
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return queryOne<Profile>(
    "SELECT * FROM profiles WHERE id = $1",
    [user.id]
  );
}

export async function requireAdminUser(): Promise<AppUser | null> {
  const user = await getCurrentUser();

  if (!user || !isAdminAccount(user.role, user.email)) {
    return null;
  }

  return user;
}
