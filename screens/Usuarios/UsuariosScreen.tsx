import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import { PrimaryButton, SectionCard } from '../../components/ui';
import {
  createFacturacionUser,
  deleteFacturacionUser,
  feRoleLabel,
  getFacturacionUsers,
  updateFacturacionUser,
} from '../../services/facturacion.service';
import type { FacturacionUser, FeRole } from '../../types';

const EMPTY = {
  name: '',
  doc_type: 'CC',
  doc: '',
  email: '',
  password: '',
  role: 'fe_user' as FeRole,
  hora_inicio: '08:00',
  hora_final: '18:00',
};

export function UsuariosScreen() {
  const { colors } = useTheme();
  const r = useResponsive();
  const [usuarios, setUsuarios] = useState<FacturacionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getFacturacionUsers();
      setUsuarios(res.data || []);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.doc?.toLowerCase().includes(q)
    );
  }, [usuarios, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (u: FacturacionUser) => {
    setEditingId(u._id);
    setForm({
      name: u.name,
      doc_type: u.doc_type,
      doc: u.doc,
      email: u.email,
      password: '',
      role: u.role,
      hora_inicio: u.hora_inicio || '08:00',
      hora_final: u.hora_final || '18:00',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.doc) {
      Alert.alert('Error', 'Complete los campos obligatorios');
      return;
    }
    if (!editingId && !form.password) {
      Alert.alert('Error', 'La contraseña es obligatoria al crear');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete (payload as { password?: string }).password;
      if (editingId) await updateFacturacionUser(editingId, payload);
      else await createFacturacionUser(payload);
      setModalOpen(false);
      await load();
      Alert.alert('Éxito', editingId ? 'Usuario actualizado' : 'Usuario creado');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar usuario', `¿Eliminar a ${name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFacturacionUser(id);
            await load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Error');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <View style={{ padding: r.spacingHorizontal, gap: 10 }}>
        <TextInput
          style={[styles.search, { borderColor: colors.inputBorder, color: colors.text }]}
          placeholder="Buscar usuarios..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        <PrimaryButton label="Nuevo usuario" onPress={openCreate} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: r.spacingHorizontal, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.email}</Text>
            <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>
              {feRoleLabel(item.role)}
            </Text>
            {item.role === 'fe_user' && (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Horario: {item.hora_inicio} — {item.hora_final}
              </Text>
            )}
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            {loading ? 'Cargando...' : 'Sin usuarios'}
          </Text>
        }
      />

      <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
        <ScrollView
          style={[styles.modal, { backgroundColor: colors.background }]}
          contentContainerStyle={{ padding: r.spacingHorizontal, paddingBottom: 40 }}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {editingId ? 'Editar usuario' : 'Nuevo usuario'}
          </Text>
          {(['name', 'email', 'doc', 'password'] as const).map((field) => (
            <View key={field} style={{ marginBottom: 10 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
                {field === 'name'
                  ? 'Nombre'
                  : field === 'email'
                    ? 'Correo'
                    : field === 'doc'
                      ? 'Documento'
                      : 'Contraseña'}
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
                value={form[field]}
                onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                secureTextEntry={field === 'password'}
                autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                keyboardType={field === 'email' ? 'email-address' : 'default'}
                placeholder={field === 'password' && editingId ? '(dejar vacío para no cambiar)' : ''}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          ))}
          <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>Rol</Text>
          <View style={styles.roleRow}>
            {(['fe_user', 'fe_admin', 'caja_fuerte'] as FeRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  {
                    borderColor: colors.primary,
                    backgroundColor: form.role === role ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setForm((f) => ({ ...f, role }))}
              >
                <Text style={{ color: form.role === role ? '#fff' : colors.primary, fontSize: 12 }}>
                  {feRoleLabel(role)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {form.role === 'fe_user' && (
            <>
              <TextInput
                style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, marginTop: 10 }]}
                placeholder="Hora inicio (HH:MM)"
                placeholderTextColor={colors.textSecondary}
                value={form.hora_inicio}
                onChangeText={(v) => setForm((f) => ({ ...f, hora_inicio: v }))}
              />
              <TextInput
                style={[styles.input, { borderColor: colors.inputBorder, color: colors.text, marginTop: 8 }]}
                placeholder="Hora final (HH:MM)"
                placeholderTextColor={colors.textSecondary}
                value={form.hora_final}
                onChangeText={(v) => setForm((f) => ({ ...f, hora_final: v }))}
              />
            </>
          )}
          <PrimaryButton label="Guardar" onPress={handleSave} loading={saving} style={{ marginTop: 16 }} />
          <PrimaryButton
            label="Cancelar"
            variant="outline"
            onPress={() => setModalOpen(false)}
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      </Modal>
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
  },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  name: { fontSize: 16, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  modal: { flex: 1, paddingTop: 48 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
