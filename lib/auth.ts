import NextAuth, { type Session } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(
    prisma as unknown as Parameters<typeof PrismaAdapter>[0]
  ),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Si el usuario no existe o se registró solo con Google (sin password)
        if (!user || !user.password) {
          return null;
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Guarda el id y el rol del usuario dentro del token JWT
    // Usamos "any" aquí a propósito: @auth/prisma-adapter y next-auth a veces
    // generan dos copias distintas del tipo AdapterUser, lo que confunde a
    // TypeScript aunque el dato sí exista en tiempo de ejecución.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "USER";
      }
      return token;
    },
    // Pasa el id y el rol del token a la sesión que se usa en el cliente/servidor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});