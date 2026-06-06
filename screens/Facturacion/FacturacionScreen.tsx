import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CajaFuertePanel } from '../../components/CajaFuertePanel';
import { CajaTurnosPanel } from '../../components/CajaTurnosPanel';
import { useAuth, useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import type { MainStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MainStackParamList, 'Facturacion'>;

export function FacturacionScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { role, isFeAdmin, isFeUser, isCajaFuerte } = useAuth();
  const r = useResponsive();
  const [turnoAbierto, setTurnoAbierto] = useState(false);

  const esVistaGestion = isFeAdmin || role === 'Admin';
  const esCajero = isFeUser || isFeAdmin;
  const puedeFacturar =
    isFeAdmin || role === 'Admin' || (isFeUser && turnoAbierto);

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        padding: r.spacingHorizontal,
        paddingBottom: r.spacingVertical * 2,
        maxWidth: r.isTablet ? 900 : undefined,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      {isCajaFuerte && (
        <CajaFuertePanel
          vistaCajaFuerte
          onOpenHistorial={() => navigation.navigate('HistorialCaja')}
        />
      )}

      {esVistaGestion && (
        <>
          <CajaTurnosPanel
            userRol={role}
            soloLectura
            onTurnoEstadoChange={setTurnoAbierto}
          />
          <CajaFuertePanel soloLectura />
        </>
      )}

      {esCajero && !esVistaGestion && (
        <CajaTurnosPanel userRol={role} onTurnoEstadoChange={setTurnoAbierto} />
      )}

      {!puedeFacturar && isFeUser && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Primero pulse <Text style={{ fontWeight: '700' }}>Abrir turno</Text>. Cuando el turno
          esté abierto, podrá facturar.
        </Text>
      )}

      {puedeFacturar && (
        <View style={[styles.billingCta, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.billingTitle, { color: colors.text }]}>Facturación POS</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>
            Abra el punto de venta electrónico para emitir comprobantes de baños.
          </Text>
          <Text
            style={[styles.billingLink, { color: colors.primary }]}
            onPress={() => navigation.navigate('Billing')}
          >
            Abrir facturación →
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hint: { marginTop: 8, lineHeight: 20, fontSize: 14 },
  billingCta: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  billingTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  billingLink: { fontSize: 16, fontWeight: '700' },
});
