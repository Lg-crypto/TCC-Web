import { addDoc, collection } from "firebase/firestore";
import type { RecordType } from "../types/recordType";
import { db } from "./firebase";

type NewRecord = Omit<RecordType, "id">;

/**
 * Adds one transaction to users/{userId}/records. `userId` scopes the write to
 * the signed-in user's collection and `record` contains gain, value, date,
 * dateKey, description, category/source and comment. Firestore resolves with
 * the created DocumentReference, including the generated document ID.
 */
export function createRecord(userId: string, record: NewRecord) {
  return addDoc(collection(db, "users", userId, "records"), record);
}
