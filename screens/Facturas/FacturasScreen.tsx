import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../contexts/AppContext';
import { useFacturacionRefresh } from '../../contexts/SocketContext';
import { useResponsive } from '../../hooks/useResponsive';
import {
  formatCurrency,
  formatDate,
  getFacturas,
} from '../../services/facturacion.service';
import type { FacturaBano } from '../../types';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Facturas'>;

export function FacturasScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const r = useResponsive();
  const [facturas, setFacturas] = useState<FacturaBano[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getFacturas({ page, limit: 20, search: search.trim() || undefined });
      setFacturas(res.data || []);
    } catch {
      setFacturas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useFacturacionRefresh(() => load(true));

  const renderItem = ({ item }: { item: FacturaBano }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => navigation.navigate('FacturaDetail', { id: item._id })}
    >
      <Text style={[styles.prefijo, { color: colors.text }]}>
        {item.prefijo_completo}-{item.numero}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
        {formatDate(item.fecha_emision_factura)} · {item.send_by || '—'}
      </Text>
      <View style={styles.row}>
        <Text style={[styles.total, { color: colors.primary }]}>
          {formatCurrency(item.total_neto)}
        </Text>
        <Text
          style={{
            color: item.status === 'liquidado' ? colors.success : colors.warning,
            fontWeight: '600',
            fontSize: 12,
          }}
        >
          {item.status === 'liquidado' ? 'Liquidada' : 'Pendiente'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={{ padding: r.spacingHorizontal }}>
        <TextInput
          style={[
            styles.search,
            { borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.inputBg },
          ]}
          placeholder="Buscar facturas..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => load()}
          returnKeyType="search"
        />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={facturas}
          keyExtractor={(item) => item._id}
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
              No hay facturas
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  prefijo: { fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  total: { fontSize: 16, fontWeight: '700' },
});
