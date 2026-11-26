import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { privacyPolicyVersion } from "../constants/privacyPolicy";
import { db } from "./firebase";

export function recordPrivacyAcceptance(userId: string) {
  return setDoc(doc(db, "users", userId), {
    privacyPolicyVersion,
    privacyAcceptedAt: serverTimestamp(),
  });
}
