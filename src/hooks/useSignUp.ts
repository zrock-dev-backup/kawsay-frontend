import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, type AuthError } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { createUserProfile } from "../services/userService";

export const useSignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    // Basic email/password validation can be added here or with a library like Yup

    setIsSubmitting(true);
    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Update the user's profile in Firebase Auth (sets displayName)
      await updateProfile(user, { displayName: name });

      // 3. Create the user's profile document in Firestore
      await createUserProfile(user, name);

      // 4. Navigate to the main dashboard on success
      navigate("/");

    } catch (err) {
      const authError = err as AuthError;
      switch (authError.code) {
        case "auth/email-already-in-use":
          setError("This email address is already in use by another account.");
          break;
        case "auth/invalid-email":
          setError("The email address is not valid.");
          break;
        case "auth/weak-password":
          setError("The password is too weak. It must be at least 6 characters long.");
          break;
        default:
          setError("An unexpected error occurred during sign up. Please try again.");
          console.error("SignUp Error:", authError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  };
};
