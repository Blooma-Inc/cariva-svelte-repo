export const lowerCaseRegex = /(?=.*[a-z])\w+/;
export const upperCaseRegex = /(?=.*[A-Z])\w+/;
export const numberRegex = /\d/;
export const specialCharcterRegex = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
export const handleCharcterRegex = /[`@?&=]/;
export const looksLikePhone = (identifier: string) => /^\+?\d[\d\s\-().]+$/.test(identifier);
