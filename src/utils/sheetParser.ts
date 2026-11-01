import * as XLSX from 'xlsx';
import { BasketballPosition, PlayerSessionRecord, Session, SessionType } from '../types/catapult';

export interface ParsedSessionResult {
  session: Session;
  warnings: string[];
}

// Clean and normalize strings
function normalizeHeader(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function distanceHeaderScore(header: string): number {
  const normalized = normalizeHeader(header);
  if (!/(dist|distance|metro|meter)/.test(normalized)) return 0;
  if (/(highspeed|sprint|zone|hml|permin|intens|velocidad)/.test(normalized)) return 1;
  if (/(totdist|totaldist|distanciatotal|distancetotal|totaldistance)/.test(normalized)) return 4;
  if (/^(dist|distance|distanciam|distanciametros|distancem|distancemeters|distancemeter)$/.test(normalized)) return 3;
  return 2;
}

function parseNumericCell(value: string | undefined): number {
  if (!value) return NaN;
  let normalized = value
    .trim()
    .replace(/[\u00a0\s]/g, '')
    .replace(/[^\d.,+\-]/g, '');
  if (!normalized || !/\d/.test(normalized)) return NaN;

  const lastComma = normalized.lastIndexOf(',');
  const lastDot = normalized.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? ',' : '.';
    const groupingSeparator = decimalSeparator === ',' ? '.' : ',';
    normalized = normalized.split(groupingSeparator).join('');
    if (decimalSeparator === ',') normalized = normalized.replace(',', '.');
  } else {
    const separator = lastComma >= 0 ? ',' : lastDot >= 0 ? '.' : '';
    if (separator) {
      const parts = normalized.split(separator);
      const trailingDigits = parts[parts.length - 1].length;
      if (parts.length > 2) {
        normalized = trailingDigits === 3
          ? parts.join('')
          : `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`;
      } else if (trailingDigits === 3 && parts[0].length <= 3) {
        normalized = parts.join('');
      } else {
        normalized = normalized.replace(separator, '.');
      }
    }
  }

  return Number(normalized);
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function detectDelimiter(lines: string[]): string {
  const candidates = ['\t', ';', ','];
  let bestDelimiter = '\t';
  let bestScore = 0;

  for (const candidate of candidates) {
    const widths = lines.slice(0, 25)
      .map(line => splitDelimitedLine(line, candidate).length)
      .filter(width => width > 1);
    if (widths.length === 0) continue;

    const widthFrequency = new Map<number, number>();
    widths.forEach(width => widthFrequency.set(width, (widthFrequency.get(width) || 0) + 1));
    const consistency = Math.max(...widthFrequency.values());
    const score = consistency * 100 + widths.length;
    if (score > bestScore) {
      bestScore = score;
      bestDelimiter = candidate;
    }
  }

  return bestScore > 0 ? bestDelimiter : ' ';
}

export function parseDelimitedText(
  text: string,
  sessionMeta: {
    title: string;
    sessionNumber: number;
    date: string;
    type: SessionType;
    durationMinutes: number;
    notes?: string;
  },
  delimiterOverride?: string
): ParsedSessionResult {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const warnings: string[] = [];
  if (lines.length === 0) {
    throw new Error('El texto proporcionado está vacío.');
  }

  // Infer the delimiter from consistent rows instead of relying on a metadata/title row.
  const delimiter = delimiterOverride || detectDelimiter(lines);

  let headerIndex = -1;
  let colIndex = {
    name: -1,
    dist: -1,
    pl: -1,
    jumps: -1,
    bmp: -1,
    min: -1,
    rpe: -1,
  };
  let distanceMultiplier = 1;

  // Inspect lines to find header
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const rawTokens = splitDelimitedLine(lines[i], delimiter);
    const normTokens = rawTokens.map(normalizeHeader);

    const hasName = normTokens.some(t => t.includes('atleta') || t.includes('jugador') || t === 'player' || t.includes('playername') || t === 'name' || t.includes('athlete'));
    const hasDist = normTokens.some(t => t.includes('dist') || t.includes('distancia') || t.includes('totdist'));
    const hasPL = normTokens.some(t => t.includes('pl') || t.includes('playerload') || t.includes('load'));
    const hasJumps = normTokens.some(t => t.includes('jump') || t.includes('salto') || t.includes('jumps'));

    if (hasName && (hasDist || hasPL || hasJumps)) {
      headerIndex = i;
      let bestDistanceScore = 0;
      rawTokens.forEach((tok, idx) => {
        const norm = normalizeHeader(tok);
        if (norm.includes('atleta') || norm.includes('jugador') || norm === 'player' || norm.includes('playername') || norm === 'name' || norm.includes('athlete')) colIndex.name = idx;
        else if (distanceHeaderScore(tok) > bestDistanceScore) {
          bestDistanceScore = distanceHeaderScore(tok);
          colIndex.dist = idx;
          distanceMultiplier = /(km|kilomet)/.test(norm) ? 1000 : 1;
        }
        else if (norm.includes('totpl') || norm.includes('totalpl') || norm.includes('playerload') || norm === 'pl') colIndex.pl = idx;
        else if (norm.includes('jump') || norm.includes('salto')) colIndex.jumps = idx;
        else if (norm.includes('bmp') || norm.includes('basketballload')) colIndex.bmp = idx;
        else if (norm.includes('min') || norm.includes('tiempo')) colIndex.min = idx;
        else if (norm.includes('rpe') || norm.includes('esfuerzo')) colIndex.rpe = idx;
      });
      break;
    }
  }

  // If no explicit header was matched, assume standard OpenField Catapult layout:
  // Col 0: Name, Col 1: Tot Dist (m), Col 2: Tot PL, Col 3: Tot Jump #, Col 4: BMP Tot Basketball Load
  if (headerIndex === -1) {
    warnings.push('No se detectó un encabezado formal; se aplicó la plantilla estándar de Catapult OpenField (Atleta, Distancia, PL, Saltos, BMP).');
    colIndex = {
      name: 0,
      dist: 1,
      pl: 2,
      jumps: 3,
      bmp: 4,
      min: -1,
      rpe: -1,
    };
    // If the first line is text/header, skip it
    if (isNaN(parseNumericCell(splitDelimitedLine(lines[0], delimiter)[1]))) {
      headerIndex = 0;
    } else {
      headerIndex = -1;
    }
  }

  const records: PlayerSessionRecord[] = [];
  const startRow = headerIndex + 1;

  if (colIndex.dist < 0) {
    warnings.push('No se identificó una columna de Distancia Total. Revisa que el archivo incluya un encabezado como “Total Distance (m)” o “Tot Dist (m)”.');
  }

  for (let i = startRow; i < lines.length; i++) {
    const rawCols = splitDelimitedLine(lines[i], delimiter);
    if (rawCols.length < 2) continue;

    // Filter out total/average lines
    const rawName = rawCols[colIndex.name] || `Jugador ${i}`;
    const lowerName = rawName.toLowerCase();
    if (lowerName.includes('total') || lowerName.includes('promedio') || lowerName.includes('average') || lowerName.includes('informe')) {
      continue;
    }

    const distVal = colIndex.dist >= 0 ? parseNumericCell(rawCols[colIndex.dist]) : NaN;
    const plVal = colIndex.pl >= 0 ? parseNumericCell(rawCols[colIndex.pl]) : NaN;
    const jumpsVal = colIndex.jumps >= 0 ? parseNumericCell(rawCols[colIndex.jumps]) : NaN;
    const bmpVal = colIndex.bmp >= 0 ? parseNumericCell(rawCols[colIndex.bmp]) : Math.round((Number.isNaN(plVal) ? 0 : plVal) * 0.88);
    const minVal = colIndex.min >= 0 ? parseNumericCell(rawCols[colIndex.min]) : sessionMeta.durationMinutes;
    const rpeVal = colIndex.rpe >= 0 ? parseNumericCell(rawCols[colIndex.rpe]) : undefined;

    // Guess position by player name or fallback
    const position = guessPositionByName(rawName);

    records.push({
      playerId: `p-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      playerName: rawName,
      position,
      minutesPlayed: isNaN(minVal) || minVal <= 0 ? sessionMeta.durationMinutes : minVal,
      totDistM: isNaN(distVal) ? 0 : Math.round(distVal * distanceMultiplier),
      totPL: isNaN(plVal) ? 0 : Math.round(plVal),
      totJumps: isNaN(jumpsVal) ? 0 : Math.round(jumpsVal),
      bmpBasketballLoad: isNaN(bmpVal) ? 0 : Math.round(bmpVal),
      rpe: rpeVal && !isNaN(rpeVal) ? rpeVal : undefined,
    });
  }

  if (records.length === 0) {
    throw new Error('No se pudieron extraer registros válidos de atletas. Revisa el formato de datos.');
  }

  if (colIndex.dist >= 0 && records.some(record => record.totDistM <= 0)) {
    warnings.push('La columna de distancia se encontró, pero hay uno o más valores vacíos o en cero. Verifica que estés importando la Distancia Total de cada jugador.');
  }

  const session: Session = {
    id: `sesion-${sessionMeta.sessionNumber}-${Date.now().toString(36)}`,
    sessionNumber: sessionMeta.sessionNumber,
    date: sessionMeta.date,
    title: sessionMeta.title || `SESIÓN ${sessionMeta.sessionNumber}`,
    type: sessionMeta.type,
    durationMinutes: sessionMeta.durationMinutes,
    notes: sessionMeta.notes || `Importado vía Catapult OpenField / Google Sheets`,
    googleSheetTab: `Sesión ${sessionMeta.sessionNumber}`,
    records,
  };

  return { session, warnings };
}

export function parseExcelFile(
  buffer: ArrayBuffer,
  sessionMeta: {
    title: string;
    sessionNumber: number;
    date: string;
    type: SessionType;
    durationMinutes: number;
    notes?: string;
  }
): ParsedSessionResult {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const csvText = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
  return parseDelimitedText(csvText, sessionMeta, '\t');
}

function guessPositionByName(name: string): BasketballPosition {
  const n = name.toLowerCase();
  if (n.includes('contrera') || n.includes('alonso')) return 'Base';
  if (n.includes('vives') || n.includes('mignani')) return 'Escolta';
  if (n.includes('catani') || n.includes('cupulutti')) return 'Alero';
  if (n.includes('luchi')) return 'Ala-Pivot';
  if (n.includes('scachi')) return 'Pivot';
  return 'Escolta';
}

export function exportSessionToCSV(session: Session): string {
  const headers = ['Atleta', 'Tot Dist (m)', 'Tot PL', 'Tot Jump #', 'BMP Tot Basketball Load', 'Minutos', 'RPE'];
  const rows = session.records.map(r => [
    r.playerName,
    r.totDistM,
    r.totPL,
    r.totJumps,
    r.bmpBasketballLoad,
    r.minutesPlayed,
    r.rpe || '',
  ]);

  return [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
}

export function downloadGoogleSheetsTemplate() {
  const sampleHeaders = ['Atleta', 'Tot Dist (m)', 'Tot PL', 'Tot Jump #', 'BMP Tot Basketball Load', 'Minutos', 'RPE', 'Notas'];
  const sampleData = [
    ['Contrera fede', 2378, 300, 133, 261, 78, 8, 'Pico de saltos'],
    ['Emiliano VIVES', 1874, 309, 51, 270, 65, 9, 'Alto PlayerLoad'],
    ['Ivan Catani', 1829, 216, 94, 168, 70, 6, 'Carga controlada'],
    ['Manuel Alonso', 1974, 238, 70, 163, 68, 6, 'Estable'],
    ['Marco luchi', 2030, 275, 123, 249, 72, 8, 'Rebote defensivo'],
    ['Sebastían Mignani', 2053, 277, 119, 227, 75, 7, 'Alta intensidad'],
    ['celestino cupulutti', 1890, 261, 99, 225, 74, 7, 'Transiciones'],
    ['juan scachi', 1827, 251, 128, 235, 70, 8, 'Volumen de salto'],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([sampleHeaders, ...sampleData]);
  XLSX.utils.book_append_sheet(wb, ws, 'Sesión 39');

  XLSX.writeFile(wb, 'Plantilla_Catapult_Básquet_GoogleSheets.xlsx');
}
