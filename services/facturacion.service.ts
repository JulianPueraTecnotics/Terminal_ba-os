import { apiGet, apiPatch, apiPost } from './api-client';
import type {
  CajaFuerteResumen,
  FacturaBano,
  FacturacionStats,
  FacturacionUser,
  LoginResponse,
  PaginationMeta,
  TurnoActualResponse,
  TurnoCaja,
} from '../types';

export async function loginRequest(correo: string, password: string) {
  return apiPost<LoginResponse>('v1/login', { correo, password }, false);
}

export async function getProfile() {
  return apiGet<{ message: string; data: Record<string, unknown> }>('v1/fe/get/profile');
}

export async function getTurnoActual() {
  return apiGet<TurnoActualResponse>('v1/caja/turno-actual');
}

export async function abrirTurno(base_inicial?: number) {
  const body = base_inicial != null ? { base_inicial } : {};
  return apiPost<{ message: string; data: TurnoCaja }>('v1/caja/abrir-turno', body);
}

export async function cerrarTurno() {
  return apiPost<{ message: string; data: TurnoCaja & { total_en_caja?: number; resumen_liquidacion_torniquete?: Record<string, unknown> } }>(
    'v1/caja/cerrar-turno'
  );
}

export async function registrarEntrega(monto: number, descripcion?: string) {
  return apiPost<{ message: string; data: TurnoCaja }>('v1/caja/registrar-entrega', {
    monto,
    descripcion,
  });
}

export async function getHistorialTurnos(page = 1, limit = 10) {
  return apiGet<{ message: string; data: TurnoCaja[]; pagination: PaginationMeta }>(
    'v1/caja/historial-turnos',
    { page, limit }
  );
}

export async function getCajaFuerteResumen(preview_torniquete_final?: number) {
  return apiGet<{ message: string; data: CajaFuerteResumen }>(
    'v1/caja-fuerte/resumen-turno',
    preview_torniquete_final != null
      ? { preview_torniquete_final }
      : undefined
  );
}

export async function patchTurnoTorniquete(body: Record<string, unknown>) {
  return apiPatch<{ message: string; data?: unknown }>('v1/caja-fuerte/turno-torniquete', body);
}

export async function getHistorialTorniquete(page = 1, limit = 10) {
  return apiGet<{ message: string; data: Record<string, unknown>[]; pagination: PaginationMeta }>(
    'v1/caja-fuerte/historial-torniquete',
    { page, limit }
  );
}

export async function getFacturas(params: {
  page?: number;
  limit?: number;
  search?: string;
  doc?: string;
  name?: string;
}) {
  return apiGet<{ message: string; data: FacturaBano[]; pagination: PaginationMeta }>(
    'v1/facturas',
    params
  );
}

export async function getFacturaById(id: string) {
  return apiGet<{ message: string; data: FacturaBano }>(`v1/facturas/${id}`);
}

export async function getFacturacionUsers() {
  return apiGet<{ message: string; data: FacturacionUser[] }>('v1/facturacion/users');
}

export async function createFacturacionUser(user: Partial<FacturacionUser> & { password: string }) {
  return apiPost<{ message: string; data: FacturacionUser }>('v1/facturacion/users', user);
}

export async function updateFacturacionUser(id: string, user: Partial<FacturacionUser> & { password?: string }) {
  return apiPutFacturacionUser(id, user);
}

async function apiPutFacturacionUser(id: string, user: Partial<FacturacionUser> & { password?: string }) {
  const { apiPut } = await import('./api-client');
  return apiPut<{ message: string; data: FacturacionUser }>(`v1/facturacion/users/${id}`, user);
}

export async function deleteFacturacionUser(id: string) {
  const { apiDelete } = await import('./api-client');
  return apiDelete<{ message: string }>(`v1/facturacion/users/${id}`);
}

export async function patchUserHorario(id: string, hora_inicio: string, hora_final: string) {
  return apiPatch<{ message: string }>(`v1/facturacion/users/${id}/horario`, {
    hora_inicio,
    hora_final,
  });
}

export async function getFacturacionStats(params: {
  from?: string;
  to?: string;
  turno_id?: string;
  fe_user?: string;
}) {
  return apiGet<{ message: string; data: FacturacionStats }>('v1/facturacion/stats', params);
}

export function buildTorniqueteBody(
  ini: string,
  fin: string,
  cort: string,
  fich: string
): { body: Record<string, number> } | { error: string } {
  const pi = String(ini ?? '').trim();
  const pf = String(fin ?? '').trim();
  const pc = String(cort ?? '').trim();
  const pFi = String(fich ?? '').trim();
  if (pi === '' && pf === '' && pc === '' && pFi === '') {
    return { error: 'Escriba al menos un número antes de guardar' };
  }
  const body: Record<string, number> = {};
  if (pi !== '') {
    const n = Number(pi);
    if (Number.isNaN(n) || n < 0) return { error: 'Contador inicial: use un número en cero o mayor' };
    body.torniquete_inicial = n;
  }
  if (pf !== '') {
    const n = Number(pf);
    if (Number.isNaN(n) || n < 0) return { error: 'Contador final: use un número en cero o mayor' };
    body.torniquete_final = n;
  }
  if (pc !== '') {
    const n = Number(pc);
    if (Number.isNaN(n) || n < 0) return { error: 'Cortesías: use un número en cero o mayor' };
    body.torniquete_cortesias = n;
  }
  if (pFi !== '') {
    const n = Number(pFi);
    if (Number.isNaN(n) || n < 0) return { error: 'Fichos: use un número en cero o mayor' };
    body.torniquete_fichos = n;
  }
  return { body };
}

export function feRoleLabel(role?: string): string {
  if (role === 'fe_admin') return 'Administrador facturación';
  if (role === 'fe_user') return 'Usuario facturación';
  if (role === 'caja_fuerte') return 'Caja fuerte';
  if (role === 'Admin') return 'Admin';
  return role || '—';
}

export function formatCurrency(value: unknown): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CO');
  } catch {
    return '—';
  }
}

export function formatNum(value: unknown): string {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('es-CO');
}
