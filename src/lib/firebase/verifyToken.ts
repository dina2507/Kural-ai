import { jwtVerify, createRemoteJWKSet } from 'jose';
import firebaseConfig from '../../../firebase-applet-config.json';

const JWKS = createRemoteJWKSet(new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
));

export async function verifyIdToken(token: string) {
  const projectId = firebaseConfig.projectId;
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  return {
    uid: payload.sub as string,
    email: (payload.email as string) ?? null,
    name: (payload.name as string) ?? null,
    photo: (payload.picture as string) ?? null,
  };
}
