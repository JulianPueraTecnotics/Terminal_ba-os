import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import { InfoRow, PrimaryButton, SectionCard } from '../../components/ui';
import {
  formatCurrency,
  formatDate,
  formatNum,
  getFacturacionStats,
} from '../../services/facturacion.service';
import type { FacturacionStats } from '../../types';

export function EstadisticasScreen() {
  const { colors } = useTheme();
  const r = useResponsive();
  const [stats, setStats] = useState<FacturacionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFacturacionStats({
        from: from.trim() || undefined,
        to: to.trim() || undefined,
      });
      setStats(res.data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const kpis = stats?.kpis as Record<string, unknown> | undefined;
  const dashboard = stats?.dashboard as Record<string, unknown> | undefined;
  const turnosRecientes = (dashboard?.turnosRecientes as Record<string, unknown>[]) || [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: r.spacingHorizontal, paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />
      }
    >
      <SectionCard title="Filtros">
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Desde (YYYY-MM-DD)"
          placeholderTextColor={colors.textSecondary}
          value={from}
          onChangeText={setFrom}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, marginTop: 8 }]}
          placeholder="Hasta (YYYY-MM-DD)"
          placeholderTextColor={colors.textSecondary}
          value={to}
          onChangeText={setTo}
        />
        <PrimaryButton label="Aplicar filtros" onPress={load} style={{ marginTop: 12 }} />
      </SectionCard>

      {loading && !stats ? (
        <ActivityIndicator color={colors.primary} />
      ) : kpis ? (
        <SectionCard title="Indicadores">
          {Object.entries(kpis).map(([key, val]) => (
            <InfoRow
              key={key}
              label={key.replace(/_/g, ' ')}
              value={
                typeof val === 'number' && key.toLowerCase().includes('total')
                  ? formatCurrency(val)
                  : String(val ?? '—')
              }
            />
          ))}
        </SectionCard>
      ) : (
        <Text style={{ color: colors.textSecondary }}>Sin datos de estadísticas</Text>
      )}

      {turnosRecientes.length > 0 && (
        <SectionCard title="Turnos recientes">
          {turnosRecientes.slice(0, 10).map((t, i) => (
            <View key={String(t._id ?? i)} style={{ marginBottom: 10 }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>
                {formatDate(t.fecha_apertura as string)}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                Vendido: {formatCurrency(t.total_vendido as number)} · Facturas:{' '}
                {formatNum(t.cantidad_facturas)}
              </Text>
            </View>
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
});
