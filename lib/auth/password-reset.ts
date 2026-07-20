export function normalizeRecoveryEmail(value: string) {
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function validateNewPassword(password: string, confirmation: string) {
  if (password.length < 12) {
    return {
      valid: false as const,
      error: "La contraseña debe tener al menos 12 caracteres.",
    };
  }
  if (password !== confirmation) {
    return {
      valid: false as const,
      error: "Las contraseñas no coinciden.",
    };
  }
  return { valid: true as const };
}
