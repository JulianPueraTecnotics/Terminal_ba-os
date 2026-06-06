import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { InfoRow, SectionCard } from '../../components/ui';
import { useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  formatCurrency,
  formatDate,
  getFacturaById,
} from '../../services/facturacion.service';
import type { FacturaBano } from '../../types';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'FacturaDetail'>;

export function FacturaDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();
  const r = useResponsive();
  const [factura, setFactura] = useState<FacturaBano | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getFacturaById(id);
        if (!cancelled) setFactura(res.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />;
  }

  if (error || !factura) {
    return (
      <Text style={{ color: colors.error, textAlign: 'center', marginTop: 40 }}>
        {error || 'Factura no encontrada'}
      </Text>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: r.spacingHorizontal, paddingBottom: 32 }}
    >
      <SectionCard title={`${factura.prefijo_completo}-${factura.numero}`}>
        <InfoRow label="Fecha" value={formatDate(factura.fecha_emision_factura)} />
        <InfoRow label="Cajero" value={factura.send_by || '—'} />
        <InfoRow label="Total bruto" value={formatCurrency(factura.total_bruto)} />
        <InfoRow label="Impuestos" value={formatCurrency(factura.total_impuestos)} />
        <InfoRow label="Total neto" value={formatCurrency(factura.total_neto)} bold />
        <InfoRow
          label="Estado liquidación"
          value={factura.status === 'liquidado' ? 'Liquidada' : 'Pendiente'}
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});
