import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../../components/BrandLogo';
import { PrimaryButton } from '../../components/ui';
import { TERMINAL_SUR_BRAND } from '../../constants/brand';
import { useAuth, useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';

export function OutOfScheduleScreen() {
  const { colors } = useTheme();
  const { outOfSchedule, clearOutOfSchedule } = useAuth();
  const r = useResponsive();

  const horaInicio = outOfSchedule?.hora_inicio || '';
  const horaFinal = outOfSchedule?.hora_final || '';
  const gracia = outOfSchedule?.gracia_minutos ?? 5;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingHorizontal: r.spacingHorizontal },
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <BrandLogo width={180} height={64} containerStyle={{ marginBottom: 16 }} />
        <Ionicons name="time-outline" size={56} color={TERMINAL_SUR_BRAND.naranja} />
        <Text style={[styles.title, { color: colors.text }]}>Estás fuera de tu horario</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Tu cuenta solo puede iniciar sesión dentro del rango horario asignado.
        </Text>
        {horaInicio && horaFinal ? (
          <View style={[styles.horarioBox, { backgroundColor: colors.inputBg }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              Horario permitido (hora Colombia)
            </Text>
            <Text style={[styles.horario, { color: colors.text }]}>
              {horaInicio} — {horaFinal}
            </Text>
            {gracia > 0 ? (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                + {gracia} min de gracia después del cierre
              </Text>
            ) : null}
          </View>
        ) : null}
        <PrimaryButton label="Volver al inicio de sesión" variant="blue" onPress={clearOutOfSchedule} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  body: { marginTop: 8, textAlign: 'center', lineHeight: 22 },
  horarioBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    alignItems: 'center',
  },
  horario: { fontSize: 20, fontWeight: '700', marginTop: 4 },
});
