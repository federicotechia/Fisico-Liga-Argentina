import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { PlayerSummary, Session, SessionType } from '../types/catapult';
import { parseDelimitedText, parseExcelFile, downloadGoogleSheetsTemplate } from '../utils/sheetParser';
import { normalizePlayerName } from '../utils/playerIdentity';
import { CADNorteLogo } from './CADNorteLogo';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSession: (session: Session, assignments: Record<string, string>, importedNames: Record<string, string>) => void;
  existingSessionsCount: number;
  roster: PlayerSummary[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  onAddSession,
  existingSessionsCount,
  roster,
}) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file' | 'link' | 'template'>('paste');
  const [pastedData, setPastedData] = useState<string>(
`Contrera fede\t2378\t300\t133\t261
Emiliano VIVES\t1874\t309\t51\t270
Ivan Catani\t1829\t216\t94\t168
Manuel Alonso\t1974\t238\t70\t163
Marco luchi\t2030\t275\t123\t249
Sebastían Mignani\t2053\t277\t119\t227
celestino cupulutti\t1890\t261\t99\t225
juan scachi\t1827\t251\t128\t235`
  );

  const [sessionTitle, setSessionTitle] = useState(`SESIÓN ${existingSessionsCount + 35}`);
  const [sessionNumber, setSessionNumber] = useState(existingSessionsCount + 35);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionType, setSessionType] = useState<SessionType>('Entrenamiento Táctico');
  const [sessionDuration, setSessionDuration] = useState(75);
  const [sessionNotes, setSessionNotes] = useState('Pestaña importada de Google Sheets - CAD Norte');

  const [sheetsUrl, setSheetsUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    session: Session;
    successText: string;
    assignments: Record<string, string>;
    displayNames: Record<string, string>;
  } | null>(null);

  const saveParsedSession = (result: ReturnType<typeof parseDelimitedText>, successText: string) => {
    const distanceError = result.warnings.find(warning =>
      /No se identificó una columna de Distancia Total|hay uno o más valores vacíos o en cero/i.test(warning)
    );
    if (distanceError) {
      setErrorMessage(`${distanceError} No se importó la sesión.`);
      setSuccessMessage(null);
      return false;
    }

    const assignments: Record<string, string> = {};
    const displayNames: Record<string, string> = {};
    result.session.records.forEach(record => {
      const key = normalizePlayerName(record.playerName);
      displayNames[key] = displayNames[key] || record.playerName;
      if (assignments[key]) return;
      const matches = roster.filter(player =>
        normalizePlayerName(player.name) === key
        || (player.aliases || []).some(alias => normalizePlayerName(alias) === key)
      );
      assignments[key] = matches.length === 1 ? matches[0].id : '';
    });
    setPendingImport({ session: result.session, successText, assignments, displayNames });
    setSuccessMessage(null);
    return true;
  };

  if (!isOpen) return null;

  const confirmImport = () => {
    if (!pendingImport || Object.values(pendingImport.assignments).some(value => !value)) return;
    const aliases = Object.fromEntries(Object.entries(pendingImport.displayNames).map(([key, name]) => [key, name]));
    onAddSession(pendingImport.session, pendingImport.assignments, aliases);
    setSuccessMessage(pendingImport.successText);
    setPendingImport(null);
    setTimeout(() => onClose(), 1200);
  };

  if (pendingImport) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
        <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-blue-800/80 bg-[#081836] shadow-2xl">
          <div className="flex items-center justify-between border-b border-blue-900/80 bg-[#040e21] p-5">
            <div><h2 className="text-lg font-black text-white">Vincular nombres con el plantel</h2><p className="mt-1 text-xs text-blue-200">Las equivalencias manuales se guardarán en los perfiles de Supabase.</p></div>
            <button type="button" onClick={() => setPendingImport(null)} aria-label="Cancelar importación" className="rounded-xl border border-blue-800 bg-blue-950 p-1.5 text-blue-300 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-3 overflow-y-auto p-5">
            <p className="rounded-xl border border-sky-800/70 bg-sky-950/30 p-3 text-xs text-sky-100">Se normalizan automáticamente tildes, mayúsculas, espacios y el prefijo “Deportivo Norte”. Revisá los nombres sin coincidencia o con más de un perfil posible.</p>
            {Object.entries(pendingImport.displayNames).map(([key, name]) => (
              <label key={key} className="grid gap-2 rounded-xl border border-blue-900 bg-[#091b38] p-3 sm:grid-cols-[1fr_1fr] sm:items-center">
                <span className="min-w-0"><span className="block truncate text-sm font-bold text-white">{name}</span><span className="text-[10px] text-blue-300">{pendingImport.assignments[key] === '__new__' ? 'Se creará un perfil nuevo' : pendingImport.assignments[key] ? 'Coincidencia con el plantel' : 'Elegí a quién corresponde'}</span></span>
                <select aria-label={`Vincular ${name}`} value={pendingImport.assignments[key]} onChange={event => setPendingImport(current => current ? { ...current, assignments: { ...current.assignments, [key]: event.target.value } } : current)} className="w-full rounded-lg border border-blue-800 bg-[#040e21] px-3 py-2 text-xs text-white">
                  <option value="">Seleccionar jugador…</option>
                  <option value="__new__">Crear perfil nuevo</option>
                  {roster.map(player => <option key={player.id} value={player.id}>{player.name}{player.jerseyNumber ? ` · #${player.jerseyNumber}` : ''}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-blue-900/80 p-4">
            <button type="button" onClick={() => setPendingImport(null)} className="rounded-xl border border-blue-800 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-950">Volver</button>
            <button type="button" onClick={confirmImport} disabled={Object.values(pendingImport.assignments).some(value => !value)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Confirmar e importar</button>
          </div>
        </div>
      </div>
    );
  }

  const handleParseAndSave = () => {
    try {
      setErrorMessage(null);
      const result = parseDelimitedText(pastedData, {
        title: sessionTitle,
        sessionNumber,
        date: sessionDate,
        type: sessionType,
        durationMinutes: sessionDuration,
        notes: sessionNotes,
      });

      saveParsedSession(result, `¡Sesión '${result.session.title}' con ${result.session.records.length} atletas cargada en CAD Norte exitosamente!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar los datos de la pestaña.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const result = parseExcelFile(buffer, {
            title: sessionTitle || file.name.replace(/\.[^/.]+$/, ''),
            sessionNumber,
            date: sessionDate,
            type: sessionType,
            durationMinutes: sessionDuration,
            notes: `Archivo importado: ${file.name}`,
          });
          saveParsedSession(result, `¡Archivo '${file.name}' importado con éxito!`);
        } catch (err: any) {
          setErrorMessage(err.message || 'Error al procesar archivo Excel.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const result = parseDelimitedText(text, {
            title: sessionTitle || file.name.replace(/\.[^/.]+$/, ''),
            sessionNumber,
            date: sessionDate,
            type: sessionType,
            durationMinutes: sessionDuration,
            notes: `Archivo importado: ${file.name}`,
          });
          saveParsedSession(result, `¡Archivo CSV '${file.name}' importado con éxito!`);
        } catch (err: any) {
          setErrorMessage(err.message || 'Error al procesar archivo CSV.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFetchSheetsUrl = async () => {
    if (!sheetsUrl.trim()) {
      setErrorMessage('Por favor ingresa el enlace de Google Sheets o CSV publicado.');
      return;
    }

    setIsLoadingUrl(true);
    setErrorMessage(null);

    try {
      let fetchUrl = sheetsUrl.trim();
      const match = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && !fetchUrl.includes('/pub?output=csv') && !fetchUrl.includes('/gviz/tq')) {
        const sheetId = match[1];
        fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error('No se pudo acceder a la hoja. Asegúrate de que el documento esté compartido como "Cualquiera con el enlace puede leer" o "Publicado en la web como CSV".');
      }

      const text = await res.text();
      const result = parseDelimitedText(text, {
        title: sessionTitle,
        sessionNumber,
        date: sessionDate,
        type: sessionType,
        durationMinutes: sessionDuration,
        notes: `Sincronizado desde Google Sheets: ${sheetsUrl.slice(0, 45)}...`,
      });

      saveParsedSession(result, `¡Datos de Google Sheets importados con éxito (${result.session.records.length} jugadores)!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo conectar con el enlace de Google Sheets.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const copyHeaderRow = () => {
    navigator.clipboard.writeText('Atleta\tTot Dist (m)\tTot PL\tTot Jump #\tBMP Tot Basketball Load\tMinutos\tRPE\tNotas');
    setCopiedHeader(true);
    setTimeout(() => setCopiedHeader(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081836] border border-blue-800/80 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-blue-900/80 flex items-center justify-between bg-[#040e21] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <CADNorteLogo size={40} />
            <div>
              <h2 className="text-lg font-black text-white">Sincronizar Google Sheets • CAD Norte</h2>
              <p className="text-xs text-blue-200/80">
                Sube una nueva pestaña de medición por cada entrenamiento o partido de Catapult.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-300 hover:text-white bg-blue-950 hover:bg-blue-900 rounded-xl transition-colors border border-blue-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-blue-900/80 bg-[#040e21]/70 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'paste'
                ? 'border-blue-500 text-sky-300'
                : 'border-transparent text-blue-300/60 hover:text-white'
            }`}
          >
            📋 Copiar y Pegar Pestaña
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'file'
                ? 'border-blue-500 text-sky-300'
                : 'border-transparent text-blue-300/60 hover:text-white'
            }`}
          >
            📁 Subir Excel / CSV
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'link'
                ? 'border-blue-500 text-sky-300'
                : 'border-transparent text-blue-300/60 hover:text-white'
            }`}
          >
            🔗 Enlace Google Sheets
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'template'
                ? 'border-blue-500 text-sky-300'
                : 'border-transparent text-blue-300/60 hover:text-white'
            }`}
          >
            📥 Plantilla &amp; Formato
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {/* Status Messages */}
          {errorMessage && (
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Session Metadata fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#040e21] p-4 rounded-2xl border border-blue-900/80">
            <div>
              <label className="text-[10px] uppercase font-bold text-blue-300 block mb-1">Pestaña / Título</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Ej. SESIÓN 40"
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-blue-300 block mb-1">Fecha</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-blue-300 block mb-1">Tipo de Sesión</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionType)}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Entrenamiento Táctico">Entrenamiento Táctico</option>
                <option value="5v5 Competitivo">5v5 Competitivo</option>
                <option value="Partido Liga">Partido Liga</option>
                <option value="Físico / Potencia">Físico / Potencia</option>
                <option value="Tiro / Regenerativo">Tiro / Regenerativo</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-blue-300 block mb-1">Duración (min)</label>
              <input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full bg-[#081836] border border-blue-900 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* TAB 1: PASTE */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white block mb-1">
                  Pega las celdas de tu Google Sheet de Deportivo Norte:
                </label>
                <p className="text-[11px] text-blue-200/70 mb-2">
                  Selecciona y copia en Google Sheets las columnas: <code className="text-sky-300 font-mono font-bold">Atleta | Tot Dist (m) | Tot PL | Tot Jump # | BMP Tot Basketball Load</code>.
                </p>
                <textarea
                  rows={8}
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  placeholder="Pega aquí los datos de la nueva sesión..."
                  className="w-full bg-[#040e21] font-mono text-xs text-blue-100 border border-blue-900 rounded-2xl p-3 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[11px] text-blue-300/70 font-medium">
                  Detecta tabulaciones, comas o puntos y coma automáticamente.
                </span>
                <button
                  onClick={handleParseAndSave}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Procesar &amp; Guardar en CAD Norte</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-blue-800/80 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-[#040e21]/60">
                <Upload className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">
                  Arrastra tu archivo Excel (.xlsx) o CSV de Catapult aquí
                </h3>
                <p className="text-xs text-blue-200/70 max-w-md mx-auto mb-4">
                  Soporta reportes directos descargados de Catapult OpenField o exportaciones de Google Sheets de CAD Norte.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md">
                  <span>Seleccionar Archivo</span>
                  <input
                    type="file"
                    accept=".csv, .xlsx, .xls, .tsv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Sincronización directa vía enlace de Google Sheets
                </h3>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Para sincronizar directamente tu Google Sheet:
                  <br />
                  1. En tu documento de Google Sheets, ve a <strong>Archivo &gt; Compartir &gt; Compartir con otros</strong> y asegúrate de que esté en <em>"Cualquier usuario con el enlace puede ver"</em>.
                  <br />
                  2. O bien ve a <strong>Archivo &gt; Compartir &gt; Publicar en la web</strong>, selecciona la pestaña deseada y elige <em>"Valores separados por comas (.csv)"</em>.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/TU_ID_DE_SHEET/..."
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    className="flex-1 bg-[#081836] border border-blue-900 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleFetchSheetsUrl}
                    disabled={isLoadingUrl}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isLoadingUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Sincronizar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="bg-[#040e21] p-4 rounded-2xl border border-blue-900/80 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Plantilla de Google Sheets recomendada para CAD Norte
                </h3>
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  Crea una nueva pestaña en tu Google Sheet por cada sesión con el nombre correspondiente (ej. <code>Sesión 39</code>, <code>Sesión 40</code>) y pega los datos con estas columnas estándar:
                </p>

                <div className="bg-[#081836] p-3 rounded-xl border border-blue-900 text-[11px] font-mono text-sky-300 overflow-x-auto">
                  Atleta | Tot Dist (m) | Tot PL | Tot Jump # | BMP Tot Basketball Load | Minutos | RPE | Notas
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={downloadGoogleSheetsTemplate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-300" />
                    <span>Descargar Plantilla Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={copyHeaderRow}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#081836] hover:bg-blue-900/40 text-blue-200 rounded-xl text-xs font-semibold transition-colors border border-blue-800"
                  >
                    {copiedHeader ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                    <span>{copiedHeader ? '¡Encabezados Copiados!' : 'Copiar Fila de Encabezados'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-900/80 bg-[#040e21] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-blue-200 rounded-xl text-xs font-bold transition-colors border border-blue-800"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
