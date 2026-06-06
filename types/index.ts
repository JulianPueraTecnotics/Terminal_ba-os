export type FeRole = 'fe_admin' | 'fe_user' | 'caja_fuerte' | 'Admin';

export interface ApiErrorResponse {
  message?: string;
  code?: string;
  hora_inicio?: string;
  hora_final?: string;
  gracia_minutos?: number;
  detalle?: Record<string, unknown>;
}

export interface JwtPayload {
  _id: string;
  rol: FeRole | string;
  name: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface EntregaTurno {
  monto: number;
  descripcion?: string;
  fecha?: string;
}

export interface TurnoCaja {
  _id: string;
  base_inicial: number;
  total_vendido: number;
  dinero_entregado: number;
  entregas?: EntregaTurno[];
  saldo_final: number | null;
  estado: 'abierto' | 'cerrado';
  fecha_apertura: string;
  fecha_cierre: string | null;
  torniquete_inicial?: number | null;
  torniquete_final?: number | null;
  torniquete_cortesias?: number | null;
  torniquete_fichos?: number | null;
  liquidacion_torniquete_ok?: boolean | null;
  fe_user?: { _id: string; name?: string; email?: string };
}

export interface TurnoActualResponse {
  message: string;
  data: TurnoCaja | null;
  estado_caja?: string;
  mensaje?: string;
  cajero?: { _id: string; name: string; email: string; role: string };
  turno_abierto?: TurnoCaja;
}

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface FacturacionUser {
  _id: string;
  name: string;
  doc_type: string;
  doc: string;
  email: string;
  role: FeRole;
  hora_inicio?: string;
  hora_final?: string;
}

export interface FacturaBano {
  _id: string;
  prefijo: string;
  numero: string;
  prefijo_completo: string;
  fecha_emision_factura: string;
  total_bruto: number;
  total_impuestos: number;
  total_neto: number;
  send_by: string;
  status: 'liquidado' | 'no_liquidado';
  raw_data?: Record<string, unknown>;
}

export interface CajaFuerteResumen {
  contexto_turno?: string;
  turno?: TurnoCaja;
  cajero?: { name?: string; email?: string };
  torniquete?: Record<string, unknown>;
  entradas_y_facturas?: Record<string, unknown>;
  cuadre_torniquete?: Record<string, unknown>;
  preview_cierre?: Record<string, unknown>;
  turnos_pendientes_cierre_torniquete?: TurnoCaja[];
}

export interface OutOfScheduleInfo {
  hora_inicio: string;
  hora_final: string;
  gracia_minutos: number;
}

export interface FacturacionStats {
  kpis?: Record<string, unknown>;
  dashboard?: Record<string, unknown>;
  filtros?: Record<string, unknown>;
}
