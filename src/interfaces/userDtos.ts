export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  // In a real academic system, you would add roles like 'student', 'faculty', 'admin'
  // For now, we'll use a simple isAdmin flag.
  isAdmin: boolean;
  createdAt: Date;
}
