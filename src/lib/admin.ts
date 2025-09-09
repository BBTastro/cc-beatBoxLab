// Admin utilities for stepBox

// Admin email list
const ADMIN_EMAILS = [
  "creativecontextstudio00@gmail.com"
];

/**
 * Check if a user is an admin based on their email
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Clear all user data from localStorage (admin function)
 */
export function clearAllUserData(): void {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Filter keys that are related to stepBox
  const stepBoxKeys = keys.filter(key => 
    key.includes('stepbox-') || 
    key.includes('challenge-') || 
    key.includes('beat-') ||
    key.includes('reward-') ||
    key.includes('ally-') ||
    key.includes('motivation-') ||
    key.includes('movement-') ||
    key.includes('detail-')
  );
  
  // Remove all stepBox-related data
  stepBoxKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`Admin: Cleared ${stepBoxKeys.length} data entries from localStorage`);
}
