// /**
//  * Normalizes an email address by trimming whitespace and converting to lowercase
//  * @param {string} email - The email address to normalize
//  * @returns {string} The normalized email address
//  */
// export const normalizeEmail = (email) => {
//   if (!email) return '';
//   return email.trim().toLowerCase();
// };

// /**
//  * Validates an email format
//  * @param {string} email - The email address to validate
//  * @returns {boolean} True if the email format is valid
//  */
// export const isValidEmail = (email) => {
//   if (!email) return false;
//   // Basic email format validation
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };
