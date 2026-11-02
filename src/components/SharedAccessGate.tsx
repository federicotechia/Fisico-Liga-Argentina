import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Session as AuthSession } from '@supabase/supabase-js';
import { AlertTriangle, Cloud, LoaderCircle, LogIn, LogOut } from 'lucide-react';
import { CADNorteLogo } from './CADNorteLogo';
import { DashboardData, hasSavedLocalDashboardData, readLocalDashboardData } from '../lib/localDashboardData';
import { loadSharedDashboardData, saveSharedDashboardData, SharedDashboardSnapshot, WorkspaceRole } from '../lib/sharedDashboardData';
import { supabase } from '../lib/supabaseClient';

interface SharedAccessGateProps {
  children: (state: {
    data: DashboardData;
    role: WorkspaceRole;
    userEmail: string;
    revision: number;
    canImportLocal: boolean;
    isSaving: boolean;
    isImporting: boolean;
    syncError: string | null;
    onSave: (data: DashboardData) => Promise<boolean>;
    onImportLocal: () => Promise<void>;
  }) => React.ReactNode;
}

const errorText = (error: unknown) => error instanceof Error ? error.message : 'No se pudo conectar con la base compartida.';

const PageFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#051124] p-4 text-slate-100 sm:p-8">
    <div className="mx-auto flex min-h-[85vh] max-w-xl items-center justify-center">
      <div className="w-full rounded-3xl border border-blue-900 bg-[#081836] p-7 shadow-2xl sm:p-9">{children}</div>
    </div>
  </div>
);

export const SharedAccessGate: React.FC<SharedAccessGateProps> = ({ children }) => {
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [shared, setShared] = useState<SharedDashboardSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const revisionRef = useRef(0);
  const authUserIdRef = useRef<string | null>(null);
  const roleRef = useRef<WorkspaceRole | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) setAuthError(error.message);
      authUserIdRef.current = data.session?.user.id ?? null;
      setAuthSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (authUserIdRef.current !== nextUserId) {
        authUserIdRef.current = nextUserId;
        roleRef.current = null;
        setShared(null);
        setLoadError(null);
        setSyncError(null);
      }
      setAuthSession(session);
    });
    return () => {
      alive = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshSharedData = useCallback(async () => {
    const userEmail = authSession?.user.email;
    if (!userEmail) return null;
    const next = await loadSharedDashboardData(userEmail);
    revisionRef.current = next.revision;
    roleRef.current = next.role;
    setShared(next);
    setLoadError(null);
    return next;
  }, [authSession?.user.email]);

  useEffect(() => {
    if (!authSession?.user.email) return;
    let alive = true;
    setShared(null);
    setLoadError(null);
    loadSharedDashboardData(authSession.user.email)
      .then(snapshot => {
        if (!alive) return;
        revisionRef.current = snapshot.revision;
        roleRef.current = snapshot.role;
        setShared(snapshot);
      })
      .catch(error => { if (alive) setLoadError(errorText(error)); });

    const poll = window.setInterval(async () => {
      if (!alive || !supabase) return;
      const membership = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', 'cad-norte')
        .eq('email', authSession.user.email!.trim().toLowerCase())
        .maybeSingle();
      if (membership.error) return;
      if (!membership.data) {
        roleRef.current = null;
        await supabase.auth.signOut();
        return;
      }
      if (membership.data.role !== roleRef.current) {
        try {
          const snapshot = await loadSharedDashboardData(authSession.user.email!);
          if (!alive) return;
          if (!snapshot.authorized) {
            roleRef.current = null;
            await supabase.auth.signOut();
            return;
          }
          roleRef.current = snapshot.role;
          revisionRef.current = snapshot.revision;
          setShared(snapshot);
          setSyncError(null);
        } catch (error) {
          if (alive) setLoadError(errorText(error));
        }
      }
      const { data, error } = await supabase
        .from('workspace_sync_state')
        .select('revision')
        .eq('workspace_id', 'cad-norte')
        .maybeSingle();
      if (error || !data) return;
      if (Number(data.revision) !== revisionRef.current) {
        try {
          const snapshot = await loadSharedDashboardData(authSession.user.email!);
          if (!alive) return;
          revisionRef.current = snapshot.revision;
          setShared(snapshot);
          setSyncError(null);
        } catch (error) {
          if (alive) setLoadError(errorText(error));
        }
      }
    }, 8000);

    return () => { alive = false; window.clearInterval(poll); };
  }, [authSession?.user.email]);

  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setIsSigningIn(true);
    setAuthError(null);
    setAuthNotice(null);
    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    setIsSigningIn(false);
    if (response.error) setAuthError(response.error.message);
  };

  const handleSignOut = async () => { await supabase?.auth.signOut(); };

  const onSave = useCallback(async (data: DashboardData) => {
    setIsSaving(true);
    try {
      revisionRef.current = await saveSharedDashboardData(data, revisionRef.current);
      setSyncError(null);
      return true;
    } catch (error) {
      const message = errorText(error);
      setSyncError(message.includes('another session') || message.includes('40001')
        ? 'Otra persona actualizó los datos. Se recargó la versión compartida para evitar pisar cambios.'
        : `No se guardó en la base compartida: ${message}`);
      try { await refreshSharedData(); } catch (refreshError) { setLoadError(errorText(refreshError)); }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [refreshSharedData]);

  const onImportLocal = useCallback(async () => {
    if (!shared || shared.role === 'viewer' || shared.data.sessions.length > 0 || shared.data.roster.length > 0) return;
    if (!hasSavedLocalDashboardData()) {
      setSyncError('Este navegador no tiene datos locales guardados para importar.');
      return;
    }
    setIsImporting(true);
    const imported = readLocalDashboardData();
    const success = await onSave(imported);
    if (success) await refreshSharedData();
    setIsImporting(false);
  }, [shared, onSave, refreshSharedData]);

  if (!supabase) return null;

  if (!authReady) return (
    <PageFrame><div className="flex items-center justify-center gap-3 text-sm text-blue-200"><LoaderCircle className="h-5 w-5 animate-spin" />Conectando con el espacio compartido...</div></PageFrame>
  );

  if (!authSession) return (
    <PageFrame>
      <div className="mb-6 flex items-center gap-3"><CADNorteLogo size={52} /><div><h1 className="text-xl font-black text-white">CAD Norte · Catapult</h1><p className="text-xs text-blue-300">Ingresá para acceder al plantel compartido</p></div></div>
      <p className="mb-5 text-sm text-blue-200">Usá tu cuenta de Google autorizada para ingresar al espacio del equipo.</p>
      {authError && <p role="alert" className="mb-4 rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-200">{authError}</p>}
      <button type="button" onClick={handleGoogleSignIn} disabled={isSigningIn} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-blue-50 disabled:opacity-60">
        {isSigningIn ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        {isSigningIn ? 'Conectando con Google…' : 'Continuar con Google'}
      </button>
      <p className="mt-4 text-center text-[11px] text-blue-300/70">Iniciar sesión no habilita el acceso automáticamente; cada correo debe estar autorizado para este espacio.</p>
    </PageFrame>
  );

  if (loadError) return (
    <PageFrame>
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /><div><h1 className="font-black text-white">No se pudo cargar el plantel</h1><p className="mt-2 text-sm text-blue-200">{loadError}</p><button onClick={() => refreshSharedData().catch(error => setLoadError(errorText(error)))} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Reintentar</button></div></div>
      <button onClick={handleSignOut} className="mt-6 flex items-center gap-2 text-xs text-blue-300 hover:text-white"><LogOut className="h-4 w-4" />Cerrar sesión</button>
    </PageFrame>
  );

  if (shared && !shared.authorized) return (
    <PageFrame>
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /><div><h1 className="font-black text-white">Cuenta pendiente de autorización</h1><p className="mt-2 text-sm text-blue-200">El correo <strong>{authSession.user.email}</strong> no está habilitado para este espacio. Pedile al administrador que agregue el correo al equipo.</p></div></div>
      <button onClick={handleSignOut} className="mt-6 flex items-center gap-2 text-xs text-blue-300 hover:text-white"><LogOut className="h-4 w-4" />Cerrar sesión</button>
    </PageFrame>
  );

  if (!shared) return <PageFrame><div className="flex items-center justify-center gap-3 text-sm text-blue-200"><LoaderCircle className="h-5 w-5 animate-spin" />Cargando jugadores y sesiones...</div></PageFrame>;

  const canImportLocal = shared.role !== 'viewer' && shared.data.sessions.length === 0 && shared.data.roster.length === 0 && hasSavedLocalDashboardData();
  return <>
    {children({
      data: shared.data,
      role: shared.role || 'viewer',
      userEmail: authSession.user.email || '',
      revision: shared.revision,
      canImportLocal,
      isSaving,
      isImporting,
      syncError,
      onSave,
      onImportLocal,
    })}
    <div className="fixed bottom-3 right-3 z-[80] hidden items-center gap-2 rounded-full border border-blue-800 bg-[#071326]/95 px-3 py-1.5 text-[10px] font-bold text-blue-200 shadow-xl sm:flex">
      <Cloud className="h-3 w-3 text-sky-400" />
      {isSaving ? 'Guardando en base compartida…' : `Conectado · ${authSession.user.email}`}
    </div>
  </>;
};
