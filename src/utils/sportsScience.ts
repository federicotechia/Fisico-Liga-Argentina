import { CalculatedPlayerMetrics, PlayerSessionRecord, PlayerSummary, Session } from '../types/catapult';

export function calculatePlayerMetrics(
  player: PlayerSummary,
  currentRecord: PlayerSessionRecord,
  allSessions: Session[],
  currentSessionId: string
): CalculatedPlayerMetrics {
  const duration = currentRecord.minutesPlayed > 0 ? currentRecord.minutesPlayed : 60;
  const plPerMin = Number((currentRecord.totPL / duration).toFixed(2));
  const distPerMin = Number((currentRecord.totDistM / duration).toFixed(1));
  const jumpsPerMin = Number((currentRecord.totJumps / duration).toFixed(2));
  const bmpRatio = Number(((currentRecord.bmpBasketballLoad / (currentRecord.totPL || 1)) * 100).toFixed(1));

  // Collect player's historical records sorted chronologically
  const sortedSessions = [...allSessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentIndex = sortedSessions.findIndex(s => s.id === currentSessionId);
  const relevantSessions = currentIndex >= 0 ? sortedSessions.slice(0, currentIndex + 1) : sortedSessions;

  const playerHistory = relevantSessions
    .map(s => {
      const rec = s.records.find(r => r.playerId === player.id || r.playerName.toLowerCase() === player.name.toLowerCase());
      return {
        date: s.date,
        totPL: rec ? rec.totPL : 0,
        totJumps: rec ? rec.totJumps : 0,
        totDistM: rec ? rec.totDistM : 0,
      };
    })
    .filter(h => h.totPL > 0);

  // Acute load (last 7 days / last 3 sessions weighted)
  const acuteCount = Math.min(playerHistory.length, 3);
  const recentSlice = playerHistory.slice(-acuteCount);
  const acuteLoad7d = recentSlice.length > 0
    ? Math.round(recentSlice.reduce((sum, h) => sum + h.totPL, 0) / recentSlice.length)
    : currentRecord.totPL;

  // Chronic load (historical baseline / 28 days)
  const chronicSlice = playerHistory.slice(-Math.min(playerHistory.length, 8));
  const chronicLoad28d = chronicSlice.length > 0
    ? Math.round(chronicSlice.reduce((sum, h) => sum + h.totPL, 0) / chronicSlice.length)
    : currentRecord.totPL;

  // ACWR calculation
  const acwr = chronicLoad28d > 0 ? Number((acuteLoad7d / chronicLoad28d).toFixed(2)) : 1.0;

  // Baseline stats for Z-Score
  const plValues = playerHistory.map(h => h.totPL);
  const meanPL = plValues.reduce((a, b) => a + b, 0) / (plValues.length || 1);
  const variancePL = plValues.reduce((a, b) => a + Math.pow(b - meanPL, 2), 0) / (plValues.length || 1);
  const stdPL = Math.sqrt(variancePL) || 20;
  const zScorePL = Number(((currentRecord.totPL - meanPL) / stdPL).toFixed(2));

  const jumpValues = playerHistory.map(h => h.totJumps);
  const meanJumps = jumpValues.reduce((a, b) => a + b, 0) / (jumpValues.length || 1);
  const varianceJumps = jumpValues.reduce((a, b) => a + Math.pow(b - meanJumps, 2), 0) / (jumpValues.length || 1);
  const stdJumps = Math.sqrt(varianceJumps) || 15;
  const zScoreJumps = Number(((currentRecord.totJumps - meanJumps) / stdJumps).toFixed(2));

  // Injury Risk & Fatigue Scoring
  const alerts: string[] = [];
  let fatigueScore = 20; // baseline 20/100

  // ACWR check
  if (acwr >= 1.5) {
    fatigueScore += 35;
    alerts.push(`ACWR Peligroso (${acwr} >= 1.50): Sobrecarga aguda con pico de fatiga. Alto riesgo de lesión muscular/tendinosa.`);
  } else if (acwr >= 1.3) {
    fatigueScore += 20;
    alerts.push(`ACWR Elevado (${acwr}): Fase de advertencia. Carga aguda 30% superior a la crónica.`);
  } else if (acwr < 0.8) {
    fatigueScore += 10;
    alerts.push(`ACWR Bajo (${acwr} < 0.80): Posible desentrenamiento o retorno progresivo.`);
  }

  // Intensity (PL/min) check for basketball
  if (plPerMin >= 4.5 && currentRecord.minutesPlayed >= 60) {
    fatigueScore += 15;
    alerts.push(`Intensidad alta sostenida (${plPerMin} PL/min durante ${currentRecord.minutesPlayed} min).`);
  }

  // Jump Spike check
  if (currentRecord.totJumps > 120) {
    fatigueScore += 20;
    alerts.push(`Pico de saltos (${currentRecord.totJumps} saltos): Gran estrés excéntrico sobre aparato extensor de la rodilla.`);
  } else if (zScoreJumps > 1.5) {
    fatigueScore += 15;
    alerts.push(`Volumen de saltos +1.5σ por encima de su media habitual.`);
  }

  // High PL with low jumps (linear/braking high mechanical load)
  if (currentRecord.totPL > 280 && currentRecord.totJumps < 60) {
    fatigueScore += 15;
    alerts.push(`Patrón de alto estrés horizontal: PL alto (${currentRecord.totPL}) con pocos saltos (${currentRecord.totJumps}) indica frenadas y cambios de dirección bruscos reiterados.`);
  }

  // Cap fatigue score 0 - 100
  fatigueScore = Math.min(100, Math.max(10, fatigueScore));

  let riskLevel: 'green' | 'yellow' | 'red' = 'green';
  if (fatigueScore >= 65 || acwr >= 1.45) {
    riskLevel = 'red';
  } else if (fatigueScore >= 40 || acwr >= 1.25) {
    riskLevel = 'yellow';
  }

  // Tailored Coach recommendation
  let recommendation = '';
  if (riskLevel === 'red') {
    recommendation = `Modificar la próxima sesión: limitar participación en 5v5 a máximo 20 min, suprimir ejercicios de pliometría/rebote y priorizar protocolo de recuperación pasiva/crioterapia.`;
  } else if (riskLevel === 'yellow') {
    recommendation = `Monitorear fatiga neuromuscular en la activación. Permitir práctica completa pero regular repeticiones de transición rápida. Hidratación y estiramientos guiados.`;
  } else {
    recommendation = `Rendimiento y asimilación óptima de carga. Habilitado para carga completa de minutos y trabajo competitivo.`;
  }

  return {
    player,
    record: currentRecord,
    plPerMin,
    distPerMin,
    jumpsPerMin,
    bmpRatio,
    acuteLoad7d,
    chronicLoad28d,
    acwr,
    fatigueScore,
    riskLevel,
    zScorePL,
    zScoreJumps,
    alerts,
    recommendation,
  };
}

export function getPositionColor(position: string): string {
  switch (position) {
    case 'Base': return 'bg-blue-600/20 text-blue-300 border-blue-500/40';
    case 'Escolta': return 'bg-sky-600/20 text-sky-300 border-sky-400/40';
    case 'Alero': return 'bg-indigo-600/20 text-indigo-300 border-indigo-400/40';
    case 'Ala-Pivot': return 'bg-blue-900/40 text-blue-200 border-blue-600/50';
    case 'Pivot': return 'bg-slate-800 text-slate-200 border-slate-700';
    default: return 'bg-blue-950 text-blue-300 border-blue-800';
  }
}

export function getRiskBadge(level: 'green' | 'yellow' | 'red') {
  switch (level) {
    case 'green':
      return {
        bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400',
        badge: 'bg-emerald-500',
        label: 'Óptimo (Verde)',
        short: 'Bajo Riesgo',
      };
    case 'yellow':
      return {
        bg: 'bg-amber-950/60 border-amber-500/40 text-amber-400',
        badge: 'bg-amber-500',
        label: 'Precaución (Amarillo)',
        short: 'Fatiga Moderada',
      };
    case 'red':
      return {
        bg: 'bg-rose-950/60 border-rose-500/40 text-rose-400',
        badge: 'bg-rose-500',
        label: 'Alerta Roja',
        short: 'Alto Riesgo',
      };
  }
}
