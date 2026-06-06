import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../contexts/AppContext';
import { useFacturacionRefresh } from '../contexts/SocketContext';
import { ApiError } from '../services/api-client';
import {
  abrirTurno,
  cerrarTurno,
  formatCurrency,
  formatDate,
  formatNum,
  getHistorialTurnos,
  getTurnoActual,
  registrarEntrega,
} from '../services/facturacion.service';
import type { TurnoCaja } from '../types';
import { InfoRow, PrimaryButton, SectionCard } from './ui';

interface CajaTurnosPanelProps {
  userRol?: string | null;
  soloLectura?: boolean;
  onTurnoEstadoChange?: (abierto: boolean) => void;
}

export function CajaTurnosPanel({
  userRol,
  soloLectura = false,
  onTurnoEstadoChange,
}: CajaTurnosPanelProps) {
  const { colors } = useTheme();
  const pideBaseInicial = userRol !== 'caja_fuerte';
  const mostrarTorniquete = soloLectura ? false : userRol !== 'fe_user';

  const [turno, setTurno] = useState<TurnoCaja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalCerrar, setModalCerrar] = useState(false);
  const [modalEntrega, setModalEntrega] = useState(false);
  const [baseInicial, setBaseInicial] = useState('');
  const [entregaMonto, setEntregaMonto] = useState('');
  const [entregaDescripcion, setEntregaDescripcion] = useState('');
  const [busy, setBusy] = useState(false);
  const [cierreData, setCierreData] = useState<{
    total_en_caja?: number;
    saldo_final?: number;
  } | null>(null);
  const [historial, setHistorial] = useState<TurnoCaja[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);

  const loadEstado = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError('');
      }
      try {
        const res = await getTurnoActual();
        const t = res.data;
        setTurno(t);
        onTurnoEstadoChange?.(!!(t && t.estado === 'abierto'));
      } catch (e) {
        if (!silent) {
          setError(e instanceof Error ? e.message : 'Error al cargar caja');
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [onTurnoEstadoChange]
  );

  useEffect(() => {
    loadEstado();
  }, [loadEstado]);

  useFacturacionRefresh(() => loadEstado(true));

  useEffect(() => {
    if (!soloLectura) return;
    const id = setInterval(() => loadEstado(true), 60_000);
    return () => clearInterval(id);
  }, [soloLectura, loadEstado]);

  const faltaTorniquete =
    turno &&
    turno.estado === 'abierto' &&
    turno.torniquete_inicial != null &&
    (turno.torniquete_final == null ||
      turno.torniquete_cortesias == null ||
      turno.torniquete_fichos == null);

  const saldoEsperado =
    turno && turno.estado === 'abierto'
      ? (turno.base_inicial || 0) + (turno.total_vendido || 0) - (turno.dinero_entregado || 0)
      : null;

  const handleAbrir = async () => {
    setBusy(true);
    try {
      let base: number | undefined;
      if (pideBaseInicial) {
        const raw = baseInicial.trim();
        if (!raw) {
          Alert.alert('Error', 'Indique la base inicial en caja');
          return;
        }
        const n = Number(raw);
        if (Number.isNaN(n) || n < 0) {
          Alert.alert('Error', 'La base inicial debe ser un número ≥ 0');
          return;
        }
        base = n;
      }
      await abrirTurno(base);
      setModalAbrir(false);
      setBaseInicial('');
      await loadEstado();
      Alert.alert('Éxito', 'Turno abierto correctamente');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo abrir turno');
    } finally {
      setBusy(false);
    }
  };

  const handleCerrar = async () => {
    if (faltaTorniquete) {
      Alert.alert(
        'Torniquete incompleto',
        'Pida a caja fuerte que anote la lectura final, cortesías y fichos antes de cerrar.'
      );
      return;
    }
    setBusy(true);
    try {
      const res = await cerrarTurno();
      setModalCerrar(false);
      setCierreData({
        total_en_caja: res.data.total_en_caja,
        saldo_final: res.data.saldo_final ?? undefined,
      });
      await loadEstado();
    } catch (e) {
      let msg = e instanceof Error ? e.message : 'Error al cerrar turno';
      if (e instanceof ApiError && e.data?.detalle) {
        msg += `\n\n${JSON.stringify(e.data.detalle, null, 2)}`;
      }
      Alert.alert('Error', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleEntrega = async () => {
    const monto = Number(entregaMonto);
    if (Number.isNaN(monto) || monto <= 0) {
      Alert.alert('Error', 'Ingrese un monto mayor a 0');
      return;
    }
    setBusy(true);
    try {
      await registrarEntrega(monto, entregaDescripcion.trim() || undefined);
      setModalEntrega(false);
      setEntregaMonto('');
      setEntregaDescripcion('');
      await loadEstado();
      Alert.alert('Éxito', 'Entrega registrada');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al registrar entrega');
    } finally {
      setBusy(false);
    }
  };

  const openHistorial = async () => {
    setShowHistorial(true);
    try {
      const res = await getHistorialTurnos(1, 20);
      setHistorial(res.data || []);
    } catch {
      setHistorial([]);
    }
  };

  if (loading) {
    return (
      <SectionCard title="Caja y turnos">
        <Text style={{ color: colors.textSecondary }}>Cargando caja...</Text>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard title="Caja y turnos">
        <Text style={{ color: colors.error }}>{error}</Text>
        <PrimaryButton label="Reintentar" onPress={() => loadEstado()} style={{ marginTop: 12 }} />
      </SectionCard>
    );
  }

  return (
    <>
      <SectionCard
        title="Caja y turnos"
        subtitle={soloLectura ? 'Solo lectura' : undefined}
        action={
          !soloLectura ? (
            <PrimaryButton
              label="Historial"
              variant="outline"
              onPress={openHistorial}
              style={{ paddingVertical: 8, minHeight: 36 }}
            />
          ) : undefined
        }
      >
        {turno && turno.estado === 'abierto' ? (
          <>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Turno abierto desde {formatDate(turno.fecha_apertura)}
            </Text>
            <InfoRow label="Base inicial" value={formatCurrency(turno.base_inicial)} />
            <InfoRow label="Total vendido" value={formatCurrency(turno.total_vendido)} />
            <InfoRow label="Dinero entregado" value={formatCurrency(turno.dinero_entregado)} />
            {mostrarTorniquete && turno.torniquete_inicial != null && (
              <InfoRow label="Torniquete inicial" value={formatNum(turno.torniquete_inicial)} />
            )}
            {mostrarTorniquete && turno.torniquete_final != null && (
              <InfoRow label="Torniquete final" value={formatNum(turno.torniquete_final)} />
            )}
            <InfoRow
              label="Saldo esperado en caja"
              value={formatCurrency(saldoEsperado)}
              bold
            />
            {!soloLectura && (
              <View style={styles.actions}>
                <PrimaryButton
                  label="Registrar vuelto"
                  variant="outline"
                  onPress={() => setModalEntrega(true)}
                />
                <PrimaryButton label="Cerrar turno" onPress={() => setModalCerrar(true)} />
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
              {soloLectura
                ? 'No hay turno abierto en este momento.'
                : 'No hay turno abierto. Abra un turno para comenzar.'}
            </Text>
            {!soloLectura && (
              <PrimaryButton label="Abrir turno" onPress={() => setModalAbrir(true)} />
            )}
          </>
        )}
      </SectionCard>

      <FormModal
        visible={modalAbrir}
        title="Abrir turno"
        onClose={() => !busy && setModalAbrir(false)}
      >
        {pideBaseInicial && (
          <>
            <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Indique el efectivo en caja al iniciar el turno.
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Base inicial ($)"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={baseInicial}
              onChangeText={setBaseInicial}
            />
          </>
        )}
        <PrimaryButton label="Abrir turno" onPress={handleAbrir} loading={busy} style={{ marginTop: 16 }} />
      </FormModal>

      <FormModal
        visible={modalCerrar}
        title="¿Cerrar turno?"
        onClose={() => !busy && setModalCerrar(false)}
      >
        <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
          Se sumará lo vendido y el dinero en caja. Las facturas quedarán liquidadas.
        </Text>
        <PrimaryButton label="Confirmar cierre" onPress={handleCerrar} loading={busy} />
      </FormModal>

      <FormModal
        visible={modalEntrega}
        title="Registrar vuelto"
        onClose={() => !busy && setModalEntrega(false)}
      >
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Monto"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
          value={entregaMonto}
          onChangeText={setEntregaMonto}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, marginTop: 12 }]}
          placeholder="Descripción (opcional)"
          placeholderTextColor={colors.textSecondary}
          value={entregaDescripcion}
          onChangeText={setEntregaDescripcion}
        />
        <PrimaryButton label="Registrar" onPress={handleEntrega} loading={busy} style={{ marginTop: 16 }} />
      </FormModal>

      <FormModal
        visible={!!cierreData}
        title="Turno cerrado"
        onClose={() => setCierreData(null)}
      >
        <Text style={{ color: colors.textSecondary }}>Dinero en caja al cierre:</Text>
        <Text style={[styles.cierreTotal, { color: colors.text }]}>
          {formatCurrency(cierreData?.total_en_caja ?? cierreData?.saldo_final)}
        </Text>
        <PrimaryButton label="Entendido" onPress={() => setCierreData(null)} style={{ marginTop: 16 }} />
      </FormModal>

      <FormModal visible={showHistorial} title="Historial de turnos" onClose={() => setShowHistorial(false)}>
        <ScrollView style={{ maxHeight: 400 }}>
          {historial.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>Sin turnos registrados</Text>
          ) : (
            historial.map((t) => (
              <View
                key={t._id}
                style={[styles.histItem, { borderColor: colors.cardBorder }]}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {formatDate(t.fecha_apertura)} — {t.estado}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                  Vendido: {formatCurrency(t.total_vendido)} · Saldo:{' '}
                  {formatCurrency(t.saldo_final)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </FormModal>
    </>
  );
}

function FormModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          {children}
          <PrimaryButton label="Cerrar" variant="outline" onPress={onClose} style={{ marginTop: 12 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  meta: { fontSize: 13, marginBottom: 8 },
  actions: { gap: 10, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  cierreTotal: { fontSize: 28, fontWeight: '700', marginVertical: 8 },
  histItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
});
