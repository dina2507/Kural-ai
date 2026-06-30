import { getDb } from './src/lib/firebase/server.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function run() {
  const db = getDb();
  const snap = await getDocs(collection(db, 'users'));
  
  if (snap.empty) {
    console.log("No users in the collection!");
    process.exit(1);
  }
  
  snap.docs.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
  process.exit(0);
}

run().catch(console.error);
