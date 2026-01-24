/**
 * Generates a patient ID based on NIC and date of birth
 * Format: REG + YYYY + MM + DD + Last 4 digits of NIC
 * Example: REG202412151234 for NIC ending in 1234 on Dec 15, 2024
 */

export const generatePatientId = (nic, dateOfBirth) => {
  if (!nic || !dateOfBirth) {
    // Fallback: generate random ID if NIC or DOB is missing
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `PAT${timestamp}${random}`.toUpperCase();
  }

  try {
    // Extract date components
    const date = new Date(dateOfBirth);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Extract last 4 digits from NIC (remove any non-numeric characters first)
    const numericNIC = nic.replace(/\D/g, '');
    const lastFourDigits = numericNIC.slice(-4);
    
    // If NIC is less than 4 digits, pad with zeros
    const paddedNIC = lastFourDigits.padStart(4, '0');
    
    // Generate ID: REG + YYYY + MM + DD + Last 4 digits of NIC
    const patientId = `REG${year}${month}${day}${paddedNIC}`;
    
    return patientId;
  } catch (error) {
    console.error('Error generating patient ID:', error);
    // Fallback: generate random ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `PAT${timestamp}${random}`.toUpperCase();
  }
};

/**
 * Generates a simple registration number based on current date and sequence
 * Format: REG + YYYY + MM + DD + 3-digit sequence
 * Example: REG20241215001
 */
export const generateRegistrationNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Generate a random 3-digit sequence (in a real app, this would come from database)
  const sequence = String(Math.floor(Math.random() * 900) + 100);
  
  return `REG${year}${month}${day}${sequence}`;
};
