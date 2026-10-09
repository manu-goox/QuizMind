/**
 * Calcula los segundos restantes de un test con límite de tiempo,
 * anclados al startTime persistido (robusto ante refrescos de página).
 *
 * Devuelve null cuando el test no tiene límite de tiempo.
 */
export function getRemainingSeconds(
  startTime: number | null,
  timeLimitMinutes: number | undefined,
  now: number,
): number | null {
  if (!timeLimitMinutes || timeLimitMinutes <= 0) return null;
  if (startTime === null) return timeLimitMinutes * 60;
  const elapsedSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
  return Math.max(0, timeLimitMinutes * 60 - elapsedSeconds);
}
