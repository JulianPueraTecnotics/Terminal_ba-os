import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/AppContext';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'blue';
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isBlue = variant === 'blue';

  const bg = isDanger
    ? colors.error
    : isBlue
      ? colors.headerBg
      : isOutline
        ? 'transparent'
        : colors.primary;
  const borderColor = isDanger ? colors.error : isBlue ? colors.headerBg : colors.primary;
  const textColor = isOutline ? colors.primary : '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled || loading ? 0.6 : 1,
        },
        isOutline && styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

export function InfoRow({ label, value, bold }: InfoRowProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          { color: colors.text, fontWeight: bold ? '700' : '500' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionCard({ title, subtitle, children, action }: SectionCardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  outline: {
    borderWidth: 1.5,
  },
  label: { fontSize: 16, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 14 },
  rowValue: { fontSize: 14, textAlign: 'right' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
});
