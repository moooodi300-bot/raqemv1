export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  errorsAr: string[];
}

/**
 * Validates strong password rules:
 * - Minimum 9 characters
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const errorsAr: string[] = [];

  if (!password || password.length < 9) {
    errors.push('Password must be at least 9 characters long');
    errorsAr.push('يجب أن تحتوي كلمة المرور على 9 أحرف على الأقل');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain at least one uppercase letter (A-Z)');
    errorsAr.push('يجب أن تحتوي على حرف كبير واحد على الأقل (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Must contain at least one lowercase letter (a-z)');
    errorsAr.push('يجب أن تحتوي على حرف صغير واحد على الأقل (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Must contain at least one number (0-9)');
    errorsAr.push('يجب أن تحتوي على رقم واحد على الأقل (0-9)');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Must contain at least one special character (!@#$%^&*)');
    errorsAr.push('يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    errorsAr,
  };
}

export const PASSWORD_REQUIREMENTS_HINT_EN = '9+ characters, uppercase, lowercase, number and symbol';
export const PASSWORD_REQUIREMENTS_HINT_AR = '9 أحرف أو أكثر، حرف كبير، حرف صغير، رقم ورمز خاص';
