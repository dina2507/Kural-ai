import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './client';

// Compress, upload to issues/{uid}/..., return a public download URL.
export async function uploadIssueImage(file: File): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You must be signed in to upload a photo.');

  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
  });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `issues/${uid}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: compressed.type || 'image/jpeg' });
  return getDownloadURL(storageRef);
}
