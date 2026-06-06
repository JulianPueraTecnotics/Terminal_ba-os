import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandLogo } from '../../components/BrandLogo';
import { PrimaryButton } from '../../components/ui';
import { TERMINAL_SUR_BRAND } from '../../constants/brand';
import { useAuth, useTheme } from '../../contexts/AppContext';
import { useResponsive } from '../../hooks/useResponsive';
import { ApiError } from '../../services/api-client';

export function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const r = useResponsive();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ correo?: string; password?: string }>({});

  const validate = () => {
    const next: { correo?: string; password?: string } = {};
    if (!correo.trim()) next.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(correo)) next.correo = 'Correo no válido';
    if (!password) next.password = 'La contraseña es requerida';
    else if (password.length < 6) next.password = 'Mínimo 6 caracteres';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(correo.trim(), password);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 403 && e.data?.code === 'OUT_OF_SCHEDULE') return;
        if (e.status === 404) Alert.alert('Error', 'Esta cuenta no existe');
        else Alert.alert('Error', e.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error. Inténtalo nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: r.spacingHorizontal },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <BrandLogo width={220} height={80} containerStyle={styles.logoWrap} />

        <View
          style={[
            styles.form,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={styles.formAccent}>
            <View style={[styles.accentHalf, { backgroundColor: TERMINAL_SUR_BRAND.azul }]} />
            <View style={[styles.accentHalf, { backgroundColor: TERMINAL_SUR_BRAND.naranja }]} />
          </View>

          <Text style={[styles.formTitle, { color: TERMINAL_SUR_BRAND.azulOscuro }]}>
            Iniciar sesión
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Baños · Facturación y caja
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Correo electrónico</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color={TERMINAL_SUR_BRAND.azul} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                styles.inputWithIcon,
                {
                  borderColor: errors.correo ? colors.error : colors.inputBorder,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                },
              ]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={correo}
              onChangeText={setCorreo}
            />
          </View>
          {errors.correo ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.correo}</Text>
          ) : null}

          <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>Contraseña</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color={TERMINAL_SUR_BRAND.azul} style={styles.inputIcon} />
            <TextInput
              style={[
                styles.input,
                styles.inputWithIcon,
                styles.passwordInput,
                {
                  borderColor: errors.password ? colors.error : colors.inputBorder,
                  color: colors.text,
                  backgroundColor: colors.inputBg,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator color={TERMINAL_SUR_BRAND.azulOscuro} style={{ marginTop: 24 }} />
          ) : (
            <PrimaryButton
              label="Iniciar sesión"
              variant="blue"
              onPress={handleSubmit}
              style={{ marginTop: 24 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingVertical: 32 },
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  form: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingTop: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  formAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    flexDirection: 'row',
  },
  accentHalf: { flex: 1 },
  formTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  formSubtitle: { fontSize: 14, marginBottom: 20 },
  label: { fontWeight: '600', marginBottom: 6, fontSize: 14 },
  inputRow: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 14, top: 14, zIndex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWithIcon: { paddingLeft: 44 },
  passwordInput: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 12, top: 12, zIndex: 1 },
  errorText: { fontSize: 12, marginTop: 4 },
});
