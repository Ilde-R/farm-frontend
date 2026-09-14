export function validateEmail(email: string): string | null {
  if (!email.trim()) return "El email es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email no válido";
  return null;
}

export function validateUsername(username: string): string | null {
  if (!username.trim()) return "El nombre de usuario es obligatorio";
  if (username.trim().length < 3) return "Mínimo 3 caracteres";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria";
  if (password.length < 8) return "Mínimo 8 caracteres";
  if (!/[A-Z]/.test(password)) return "Debe tener 1 mayúscula";
  if (!/[a-z]/.test(password)) return "Debe tener 1 minúscula";
  if (!/[0-9]/.test(password)) return "Debe tener 1 número";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Debe tener 1 carácter especial";
  return null;
}
