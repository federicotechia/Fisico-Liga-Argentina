/** Normalize harmless variations from Catapult exports before matching a player. */
export function normalizePlayerName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^\s*(?:club\s+)?(?:deportivo\s+norte|cad\s+norte)\s*[-–—:]?\s*/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function playerNameMatches(name: string, aliases: string[] = [], candidate: string): boolean {
  const normalizedCandidate = normalizePlayerName(candidate);
  return normalizePlayerName(name) === normalizedCandidate
    || aliases.some(alias => normalizePlayerName(alias) === normalizedCandidate);
}

export function createPlayerIdFromName(name: string, seasonId: string): string {
  const slug = normalizePlayerName(name).replace(/\s+/g, '-');
  return `player-${seasonId}-${slug || 'sin-nombre'}`;
}
