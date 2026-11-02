import React, { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, ShieldCheck, UserPlus, UserRoundCog, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { WorkspaceRole } from '../lib/sharedDashboardData';

interface WorkspaceMember {
  email: string;
  role: WorkspaceRole;
  created_at: string;
}

interface WorkspaceMembersModalProps {
  isOpen: boolean;
  currentEmail: string;
  onClose: () => void;
}

const roleLabels: Record<WorkspaceRole, string> = {
  owner: 'Admin · control total',
  trainer: 'PF · gestiona datos y sesiones',
  viewer: 'Visualizador · solo consulta',
};

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo actualizar el equipo.';

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({ isOpen, currentEmail, onClose }) => {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('trainer');
  const [isLoading, setIsLoading] = useState(false);
  const [savingEmail, setSavingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!supabase) return;
    setIsLoading(true);
    setError(null);
    const result = await supabase
      .from('workspace_members')
      .select('email, role, created_at')
      .eq('workspace_id', 'cad-norte')
      .order('created_at', { ascending: true });
    setIsLoading(false);
    if (result.error) {
      setError(errorMessage(result.error));
      return;
    }
    setMembers((result.data || []) as WorkspaceMember[]);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setNotice(null);
    void loadMembers();
  }, [isOpen, loadMembers]);

  if (!isOpen) return null;

  const saveMember = async (memberEmail: string, memberRole: WorkspaceRole) => {
    if (!supabase) return;
    const normalizedEmail = memberEmail.trim().toLowerCase();
    setSavingEmail(normalizedEmail);
    setError(null);
    setNotice(null);
    const result = await supabase.rpc('upsert_workspace_member', {
      p_email: normalizedEmail,
      p_role: memberRole,
    });
    setSavingEmail(null);
    if (result.error) {
      setError(errorMessage(result.error));
      return;
    }
    setEmail('');
    setNotice(`${normalizedEmail} quedó habilitado como ${roleLabels[memberRole].split(' · ')[0]}.`);
    await loadMembers();
  };

  const removeMember = async (member: WorkspaceMember) => {
    if (!supabase) return;
    const confirmed = window.confirm(`¿Quitar a ${member.email} del espacio? Se conservarán sus datos registrados.`);
    if (!confirmed) return;
    setSavingEmail(member.email);
    setError(null);
    setNotice(null);
    const result = await supabase.rpc('remove_workspace_member', { p_email: member.email });
    setSavingEmail(null);
    if (result.error) {
      setError(errorMessage(result.error));
      return;
    }
    setNotice(`${member.email} ya no tiene acceso. Sus datos registrados se conservaron.`);
    await loadMembers();
  };

  const adminCount = members.filter(member => member.role === 'owner').length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="workspace-members-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-blue-800 bg-[#07162d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-900/80 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-700 bg-blue-950/70 p-2 text-sky-300"><Users className="h-5 w-5" /></div>
            <div>
              <h2 id="workspace-members-title" className="text-lg font-black text-white">Usuarios y permisos</h2>
              <p className="text-xs text-blue-300">Los usuarios ingresan con Google; el correo define el rol.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar usuarios y permisos" className="rounded-lg p-2 text-blue-300 hover:bg-blue-900/60 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <form onSubmit={event => { event.preventDefault(); void saveMember(email, role); }} className="grid gap-3 rounded-2xl border border-blue-900 bg-[#091b38] p-4 sm:grid-cols-[1fr_230px_auto] sm:items-end">
            <label className="block text-xs font-bold text-blue-200">Correo de Google
              <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="persona@gmail.com" className="mt-1.5 w-full rounded-xl border border-blue-800 bg-[#040e21] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
            </label>
            <label className="block text-xs font-bold text-blue-200">Rol
              <select value={role} onChange={event => setRole(event.target.value as WorkspaceRole)} className="mt-1.5 w-full rounded-xl border border-blue-800 bg-[#040e21] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                <option value="owner">Admin · control total</option>
                <option value="trainer">PF · gestiona jugadores y sesiones</option>
                <option value="viewer">Visualizador · solo consulta</option>
              </select>
            </label>
            <button type="submit" disabled={!!savingEmail || !email.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-500 disabled:opacity-60">
              {savingEmail === email.trim().toLowerCase() ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Habilitar
            </button>
          </form>

          {error && <p role="alert" className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-xs text-rose-200">{error}</p>}
          {notice && <p role="status" className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-xs text-emerald-200">{notice}</p>}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-black text-white">Cuentas habilitadas</h3>
              <span className="text-[11px] text-blue-300">{members.length} usuarios</span>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-blue-900 bg-[#091b38] p-6 text-xs text-blue-200"><LoaderCircle className="h-4 w-4 animate-spin" />Cargando equipo…</div>
            ) : members.length === 0 ? (
              <p className="rounded-xl border border-blue-900 bg-[#091b38] p-5 text-xs text-blue-300">Todavía no hay usuarios habilitados.</p>
            ) : (
              <div className="divide-y divide-blue-900/70 overflow-hidden rounded-xl border border-blue-900 bg-[#091b38]">
                {members.map(member => (
                  <div key={member.email} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_230px_auto] sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{member.email}{member.email === currentEmail.toLowerCase() && <span className="ml-2 text-[10px] font-semibold text-sky-300">Vos</span>}</p>
                      <p className="mt-0.5 text-[10px] text-blue-300">{member.role === 'owner' ? <ShieldCheck className="mr-1 inline h-3 w-3" /> : <UserRoundCog className="mr-1 inline h-3 w-3" />}{roleLabels[member.role]}</p>
                    </div>
                    <select aria-label={`Rol de ${member.email}`} value={member.role} disabled={!!savingEmail || (member.role === 'owner' && adminCount <= 1)} onChange={event => void saveMember(member.email, event.target.value as WorkspaceRole)} className="w-full rounded-lg border border-blue-800 bg-[#040e21] px-2.5 py-2 text-xs text-white disabled:opacity-55">
                      <option value="owner">Admin</option>
                      <option value="trainer">PF</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                    <button type="button" disabled={!!savingEmail || (member.role === 'owner' && adminCount <= 1)} onClick={() => void removeMember(member)} className="rounded-lg border border-rose-900/80 px-3 py-2 text-[11px] font-bold text-rose-300 hover:bg-rose-950/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Quitar acceso</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] leading-relaxed text-blue-300/75">Al habilitar un correo, su titular puede iniciar sesión con Google. Si todavía no lo hizo, puede acceder la primera vez después de que lo autorices. Quitar el acceso no borra jugadores ni sesiones.</p>
        </div>
      </div>
    </div>
  );
};
