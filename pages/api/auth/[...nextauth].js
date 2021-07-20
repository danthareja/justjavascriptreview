import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // These callbacks ensure the profile returned from the provider
    // is set as the the 'user' object on the session
    async session(session, token) {
      session.user = token.user;
      return session;
    },
    async jwt(token, user) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
});
