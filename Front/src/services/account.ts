import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const userCollections = ["records", "subscriptions"] as const;

export async function deleteAccountData(userId: string) {
  const snapshots = await Promise.all(
    userCollections.map((name) => getDocs(collection(db, "users", userId, name))),
  );
  const documents = snapshots.flatMap((snapshot) => snapshot.docs);

  for (let offset = 0; offset < documents.length; offset += 450) {
    const batch = writeBatch(db);
    documents
      .slice(offset, offset + 450)
      .forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }

  await deleteDoc(doc(db, "users", userId));
}
