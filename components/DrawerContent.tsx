import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../contexts/AppContext';
import { useTheme } from '../contexts/AppContext';
import { feRoleLabel } from '../services/facturacion.service';
import { useResponsive } from '../hooks/useResponsive';

export interface DrawerMenuItem {
  route: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  roles?: string[];
}

interface DrawerContentProps {
  items: DrawerMenuItem[];
  onNavigate: (route: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

export function DrawerContent({
  items,
  onNavigate,
  onClose,
  onLogout,
}: DrawerContentProps) {
  const { colors } = useTheme();
  const { user, role } = useAuth();
  const r = useResponsive();

  const visibleItems = items.filter(
    (item) => !item.roles || (role && item.roles.includes(role))
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.card }]}
      contentContainerStyle={{ paddingHorizontal: r.spacingHorizontal }}
    >
      <View style={styles.header}>
        <BrandLogo width={170} height={56} containerStyle={{ marginBottom: 12 }} />
        {user?.name ? (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {user.name}
          </Text>
        ) : null}
        {role ? (
          <Text style={[styles.role, { color: colors.primaryText }]}>
            {feRoleLabel(role)}
          </Text>
        ) : null}
      </View>

      {visibleItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={[styles.menuItem, { borderColor: colors.cardBorder }]}
          onPress={() => {
            onNavigate(item.route);
            onClose();
          }}
        >
          <Ionicons name={item.icon} size={22} color={colors.primaryText} />
          <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.error }]}
        onPress={() => {
          onClose();
          onLogout();
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 24, marginTop: 8 },
  title: { fontWeight: '700' },
  subtitle: { marginTop: 4, fontSize: 14 },
  role: { marginTop: 2, fontSize: 13, fontWeight: '600' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
