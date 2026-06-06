import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  formatCurrency,
  formatDate,
  formatNum,
  getHistorialTorniquete,
} from '../../services/facturacion.service';

interface HistRow {
  key: string;
  fecha_apertura?: string;
  fecha_cierre?: string;
  cajero?: string;
  inicial?: number | null;
  final?: number | null;
  cortesias?: number | null;
  fichos?: number | null;
  liquidacionOk?: boolean | null;
  cantidadFacturas?: number | null;
  totalNeto?: number | null;
  saldoFinal?: number | null;
}

function normalize(row: Record<string, unknown>): HistRow {
  const t = row.torniquete as Record<string, unknown> | undefined;
  const ef = row.entradas_y_facturas as Record<string, unknown> | undefined;
  const c = row.cajero as Record<string, unknown> | string | undefined;
  return {
    key: String(row.turno_id ?? row._id ?? Math.random()),
    fecha_apertura: row.fecha_apertura as string,
    fecha_cierre: row.fecha_cierre as string,
    cajero:
      typeof c === 'object' && c
        ? String(c.name || c.email || '—')
        : typeof c === 'string'
          ? c
          : '—',
    inicial: (row.torniquete_inicial ?? t?.inicial) as number | null,
    final: (row.torniquete_final ?? t?.final) as number | null,
    cortesias: (row.torniquete_cortesias ?? t?.cortesias_declaradas) as number | null,
    fichos: (row.torniquete_fichos ?? t?.fichos_declarados) as number | null,
    liquidacionOk: (row.liquidacion_torniquete_ok ?? t?.liquidacion_ok) as boolean | null,
    cantidadFacturas: ef?.cantidad_facturas as number | null,
    totalNeto: ef?.total_neto as number | null,
    saldoFinal: row.saldo_final as number | null,
  };
}

export function HistorialCajaScreen() {
  const { colors } = useTheme();
  const r = useResponsive();
  const [rows, setRows] = useState<HistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getHistorialTorniquete(1, 30);
      setRows((res.data || []).map((r) => normalize(r as Record<string, unknown>)));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: HistRow }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.title, { color: colors.text }]}>{item.cajero}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        Apertura: {formatDate(item.fecha_apertura)} · Cierre: {formatDate(item.fecha_cierre)}
      </Text>
      <Text style={{ color: colors.text, fontSize: 13, marginTop: 6 }}>
        Torn. {formatNum(item.inicial)} → {formatNum(item.final)} · Cort: {formatNum(item.cortesias)} ·
        Fichos: {formatNum(item.fichos)}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
        Facturas: {formatNum(item.cantidadFacturas)} · Neto: {formatCurrency(item.totalNeto)}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontWeight: '600',
          color:
            item.liquidacionOk === true
              ? colors.success
              : item.liquidacionOk === false
                ? colors.error
                : colors.textSecondary,
        }}
      >
        {item.liquidacionOk === true
          ? 'Cuadra'
          : item.liquidacionOk === false
            ? 'Descuadre'
            : 'Sin dato'}
      </Text>
    </View>
  );

  if (loading && rows.length === 0) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      contentContainerStyle={{ padding: r.spacingHorizontal, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load(true);
          }}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
          Sin historial
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
