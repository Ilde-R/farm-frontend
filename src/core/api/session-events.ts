type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

/**
 * Suscribe un callback que se ejecuta cuando la sesión deja de ser válida
 * (por ejemplo, cuando el refresh del token falla en el interceptor de axios).
 * Devuelve una función para cancelar la suscripción.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSessionExpired(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Un listener no debe impedir que se notifique a los demás.
    }
  });
}
