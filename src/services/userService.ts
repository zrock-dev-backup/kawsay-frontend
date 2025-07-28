import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import type { UserProfile } from "../interfaces/userDtos";
import type { User } from "firebase/auth";

/**
 * Retrieves a user's profile from Firestore.
 * @param uid The user's unique ID from Firebase Auth.
 * @returns The user profile object or null if not found.
 */
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const data = userDocSnap.data();
    return {
      uid: data.uid,
      email: data.email,
      name: data.name,
      isAdmin: data.isAdmin || false,
      createdAt: data.createdAt.toDate(),
    };
  }
  return null;
};

/**
 * Creates a new user profile in Firestore.
 * @param user The user object from Firebase Auth after creation.
 * @param name The user's full name.
 */
export const createUserProfile = async (
  user: User,
  name: string,
): Promise<void> => {
  const userDocRef = doc(db, "users", user.uid);
  const newUserProfile: Omit<UserProfile, "createdAt"> = {
    uid: user.uid,
    email: user.email!,
    name: name,
    isAdmin: false, // Default to non-admin
  };

  await setDoc(userDocRef, {
    ...newUserProfile,
    createdAt: serverTimestamp(),
  });
};
