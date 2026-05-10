import { differenceInYears, isValid, parseISO } from "date-fns";

/**
 * Calculates age from a birth date.
 * @param birthDate string (YYYY-MM-DD) or Date object
 * @returns Age in years, or -1 if invalid
 */
export function calculateAge(birthDate: string | Date): number {
  if (!birthDate) return -1;
  
  const date = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
  
  if (!isValid(date)) return -1;
  
  return differenceInYears(new Date(), date);
}

/**
 * Checks if a user is an adult (>= 18 years old).
 * @param birthDate string (YYYY-MM-DD) or Date object
 * @returns true if adult, false otherwise
 */
export function isAdult(birthDate: string | Date): boolean {
  const age = calculateAge(birthDate);
  return age >= 18;
}
