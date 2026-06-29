import { auth } from './firebase/client';

// Like fetch(), but forwards the signed-in user's identity to the server.
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  const headers = new Headers(init.headers || {});
  if (user) {
    headers.set('x-user-id', user.uid);
    if (user.email) headers.set('x-user-email', user.email);
    if (user.displayName) headers.set('x-user-name', user.displayName);
    if (user.photoURL) headers.set('x-user-photo', user.photoURL);
  }
  return fetch(input, { ...init, headers });
}
