/** Dev helper: prints an admin session cookie for curl-based testing.  npx tsx scripts/dev-token.ts */
import { SignJWT } from "jose";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "dev-only-insecure-secret-change-me-spinex-home");
new SignJWT({ uid: 1, role: "admin", name: "Spinex Admin", email: "admin@spinexhome.in" })
  .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secret)
  .then((t) => console.log(`spx_session=${t}`));
