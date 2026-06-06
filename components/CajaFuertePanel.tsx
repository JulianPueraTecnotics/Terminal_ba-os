import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../contexts/AppContext';
import { useFacturacionRefresh } from '../contexts/SocketContext';
import {
  buildTorniqueteBody,
  formatCurrency,
  formatDate,
  formatNum,
  getCajaFuerteResumen,
  patchTurnoTorniquete,
} from '../services/facturacion.service';
import type { CajaFuerteResumen, TurnoCaja } from '../types';
import { InfoRow, PrimaryButton, SectionCard } from './ui';

interface CajaFuertePanelProps {
  soloLectura?: boolean;
  vistaCajaFuerte?: boolean;
  onOpenHistorial?: () => void;
}

export function CajaFuertePanel({
  soloLectura = false,
  vistaCajaFuerte = false,
  onOpenHistorial,
}: CajaFuertePanelProps) {
  const { colors } = useTheme();
  const [payload, setPayload] = useState<CajaFuerteResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formIni, setFormIni] = useState('');
  const [formFin, setFormFin] = useState('');
  const [formCort, setFormCort] = useState('');
  const [formFich, setFormFich] = useState('');
  const [saving, setSaving] = useState(false);

  const applyTurnoToForm = useCallback((turno?: TurnoCaja | null) => {
    if (!turno) return;
    setFormIni(turno.torniquete_inicial != null ? String(turno.torniquete_inicial) : '');
    setFormFin(turno.torniquete_final != null ? String(turno.torniquete_final) : '');
    setFormCort(turno.torniquete_cortesias != null ? String(turno.torniquete_cortesias) : '');
    setFormFich(turno.torniquete_fichos != null ? String(turno.torniquete_fichos) : '');
  }, []);

  const fetchResumen = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
        setError('');
      }
      try {
        const res = await getCajaFuerteResumen();
        const data = res.data;
        setPayload(data);
        if (data?.turno) applyTurnoToForm(data.turno);
      } catch (e) {
        if (!silent) setError(e instanceof Error ? e.message : 'Error al cargar');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [applyTurnoToForm]
  );

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  useFacturacionRefresh(() => fetchResumen(true));

  useEffect(() => {
    const ctx = payload?.contexto_turno;
    const hayTurnoActual =
      ctx === 'turno_abierto' || (ctx == null && payload?.turno?.estado === 'abierto');
    const ms = hayTurnoActual ? 60_000 : 10_000;
    const id = setInterval(() => fetchResumen(true), ms);
    return () => clearInterval(id);
  }, [payload?.contexto_turno, payload?.turno?.estado, fetchResumen]);

  const handleGuardar = async () => {
    if (!vistaCajaFuerte) {
      Alert.alert('Acceso denegado', 'Solo caja fuerte puede guardar lecturas');
      return;
    }
    const built = buildTorniqueteBody(formIni, formFin, formCort, formFich);
    if ('error' in built) {
      Alert.alert('Error', built.error);
      return;
    }
    setSaving(true);
    try {
      await patchTurnoTorniquete(built.body);
      Alert.alert('Éxito', 'Guardado correctamente');
      await fetchResumen(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleGuardarPendiente = async (turnoId: string, st: {
    ini: string;
    fin: string;
    cort: string;
    fich: string;
  }) => {
    if (!vistaCajaFuerte) return;
    const built = buildTorniqueteBody(st.ini, st.fin, st.cort, st.fich);
    if ('error' in built) {
      Alert.alert('Error', built.error);
      return;
    }
    setSaving(true);
    try {
      await patchTurnoTorniquete({ turno_id: turnoId, ...built.body });
      Alert.alert('Éxito', 'Guardado correctamente');
      await fetchResumen(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !payload) {
    return (
      <SectionCard title="Caja fuerte">
        <Text style={{ color: colors.textSecondary }}>Cargando…</Text>
      </SectionCard>
    );
  }

  const turno = payload?.turno;
  const entradas = payload?.entradas_y_facturas as Record<string, unknown> | undefined;
  const cuadre = payload?.cuadre_torniquete as Record<string, unknown> | undefined;
  const pendientes = payload?.turnos_pendientes_cierre_torniquete || [];
  const esTurnoAbierto = payload?.contexto_turno === 'turno_abierto' || turno?.estado === 'abierto';

  return (
    <SectionCard
      title="Caja fuerte"
      subtitle={soloLectura ? 'Solo lectura' : undefined}
      action={
        !soloLectura && onOpenHistorial ? (
          <PrimaryButton
            label="Historial"
            variant="outline"
            onPress={onOpenHistorial}
            style={{ paddingVertical: 8, minHeight: 36 }}
          />
        ) : undefined
      }
    >
      {error ? <Text style={{ color: colors.error, marginBottom: 8 }}>{error}</Text> : null}

      {!turno ? (
        <Text style={{ color: colors.textSecondary }}>Sin turnos registrados.</Text>
      ) : (
        <>
          <Text style={[styles.badge, { color: esTurnoAbierto ? colors.success : colors.textSecondary }]}>
            {esTurnoAbierto ? 'Turno abierto' : 'Último turno cerrado'}
          </Text>
          {payload?.cajero?.name ? (
            <InfoRow label="Cajero" value={String(payload.cajero.name)} />
          ) : null}
          <InfoRow label="Apertura" value={formatDate(turno.fecha_apertura)} />
          {turno.fecha_cierre ? (
            <InfoRow label="Cierre" value={formatDate(turno.fecha_cierre)} />
          ) : null}
          {entradas?.cantidad_facturas != null && (
            <InfoRow label="Comprobantes" value={formatNum(entradas.cantidad_facturas)} />
          )}
          {entradas?.total_neto != null && (
            <InfoRow label="Total facturado" value={formatCurrency(entradas.total_neto)} />
          )}
          {cuadre?.total_personas != null && (
            <InfoRow label="Personas (torniquete)" value={formatNum(cuadre.total_personas)} />
          )}
          {cuadre?.total_movimientos != null && (
            <InfoRow label="Movimientos" value={formatNum(cuadre.total_movimientos)} />
          )}
          {cuadre?.diferencia != null && (
            <InfoRow
              label="Diferencia"
              value={formatNum(cuadre.diferencia)}
              bold={Number(cuadre.diferencia) !== 0}
            />
          )}

          {vistaCajaFuerte && !soloLectura && (
            <View style={styles.form}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Lecturas torniquete</Text>
              <FieldInput label="Inicial" value={formIni} onChange={setFormIni} colors={colors} />
              <FieldInput label="Final" value={formFin} onChange={setFormFin} colors={colors} />
              <FieldInput label="Cortesías" value={formCort} onChange={setFormCort} colors={colors} />
              <FieldInput label="Fichos" value={formFich} onChange={setFormFich} colors={colors} />
              <PrimaryButton label="Guardar lecturas" onPress={handleGuardar} loading={saving} />
            </View>
          )}
        </>
      )}

      {pendientes.length > 0 && vistaCajaFuerte && (
        <View style={{ marginTop: 16 }}>
          <Text style={[styles.formTitle, { color: colors.text }]}>
            Turnos pendientes de cierre torniquete
          </Text>
          {pendientes.map((tp) => (
            <PendienteCard
              key={tp._id}
              turno={tp}
              colors={colors}
              onSave={(st) => handleGuardarPendiente(tp._id, st)}
              saving={saving}
            />
          ))}
        </View>
      )}
    </SectionCard>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: { inputBorder: string; text: string; textSecondary: string };
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 4, fontSize: 13 }}>{label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        placeholder="0"
        placeholderTextColor={colors.textSecondary}
      />
    </View>
  );
}

function PendienteCard({
  turno,
  colors,
  onSave,
  saving,
}: {
  turno: TurnoCaja;
  colors: { cardBorder: string; text: string; textSecondary: string; inputBorder: string };
  onSave: (st: { ini: string; fin: string; cort: string; fich: string }) => void;
  saving: boolean;
}) {
  const [ini, setIni] = useState(turno.torniquete_inicial != null ? String(turno.torniquete_inicial) : '');
  const [fin, setFin] = useState(turno.torniquete_final != null ? String(turno.torniquete_final) : '');
  const [cort, setCort] = useState(turno.torniquete_cortesias != null ? String(turno.torniquete_cortesias) : '');
  const [fich, setFich] = useState(turno.torniquete_fichos != null ? String(turno.torniquete_fichos) : '');

  return (
    <View style={[styles.pendiente, { borderColor: colors.cardBorder }]}>
      <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>
        {formatDate(turno.fecha_apertura)}
      </Text>
      <FieldInput label="Inicial" value={ini} onChange={setIni} colors={colors} />
      <FieldInput label="Final" value={fin} onChange={setFin} colors={colors} />
      <FieldInput label="Cortesías" value={cort} onChange={setCort} colors={colors} />
      <FieldInput label="Fichos" value={fich} onChange={setFich} colors={colors} />
      <PrimaryButton
        label="Guardar pendiente"
        onPress={() => onSave({ ini, fin, cort, fich })}
        loading={saving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { fontWeight: '700', marginBottom: 8 },
  form: { marginTop: 16 },
  formTitle: { fontWeight: '700', marginBottom: 10, fontSize: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  pendiente: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
});
