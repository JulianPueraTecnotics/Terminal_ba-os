import React, { useCallback, useMemo, useState } from 'react';
import { CommonActions, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerContent, DrawerMenuItem } from '../components/DrawerContent';
import { HeaderRightActions } from '../components/HeaderRightActions';
import { LateralDrawer } from '../components/LateralDrawer';
import { useAuth, useTheme } from '../contexts/AppContext';
import { BillingScreen } from '../screens/Billing/BillingScreen';
import { EstadisticasScreen } from '../screens/Estadisticas/EstadisticasScreen';
import { FacturaDetailScreen } from '../screens/FacturaDetail/FacturaDetailScreen';
import { FacturacionScreen } from '../screens/Facturacion/FacturacionScreen';
import { FacturasScreen } from '../screens/Facturas/FacturasScreen';
import { HistorialCajaScreen } from '../screens/HistorialCaja/HistorialCajaScreen';
import { UsuariosScreen } from '../screens/Usuarios/UsuariosScreen';
import type { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

interface MainNavigatorProps {
  navigationRef: React.RefObject<NavigationContainerRef<MainStackParamList> | null>;
}

export function MainNavigator({ navigationRef }: MainNavigatorProps) {
  const { colors } = useTheme();
  const { role, logout, isFeAdmin } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initialRoute = isFeAdmin ? 'Facturas' : 'Facturacion';

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const renderHeaderRight = useCallback(
    () => <HeaderRightActions onOpenMenu={openDrawer} />,
    [openDrawer]
  );

  const menuItems: DrawerMenuItem[] = useMemo(() => {
    const items: DrawerMenuItem[] = [
      {
        route: 'Facturacion',
        label: 'Caja y torniquete',
        icon: 'cash-outline',
        roles: ['fe_admin', 'fe_user', 'caja_fuerte', 'Admin'],
      },
      {
        route: 'Billing',
        label: 'Facturación POS',
        icon: 'receipt-outline',
        roles: ['fe_admin', 'fe_user', 'Admin'],
      },
      {
        route: 'Facturas',
        label: 'Facturas',
        icon: 'document-text-outline',
        roles: ['fe_admin', 'Admin'],
      },
      {
        route: 'Estadisticas',
        label: 'Estadísticas',
        icon: 'bar-chart-outline',
        roles: ['fe_admin', 'Admin'],
      },
      {
        route: 'Usuarios',
        label: 'Usuarios FE',
        icon: 'people-outline',
        roles: ['fe_admin', 'Admin'],
      },
      {
        route: 'HistorialCaja',
        label: 'Historial torniquete',
        icon: 'time-outline',
        roles: ['caja_fuerte', 'fe_admin', 'Admin'],
      },
    ];
    return items;
  }, []);

  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.headerBg },
      headerTintColor: colors.headerText,
      headerTitleStyle: { fontWeight: '600' as const },
      headerShadowVisible: false,
      headerRight: renderHeaderRight,
    }),
    [colors.headerBg, colors.headerText, renderHeaderRight]
  );

  const handleNavigate = useCallback(
    (route: string) => {
      navigationRef.current?.dispatch(CommonActions.navigate({ name: route }));
    },
    [navigationRef]
  );

  return (
    <>
      <Stack.Navigator
        key={`${colors.headerBg}-${role}`}
        initialRouteName={initialRoute}
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Facturacion"
          component={FacturacionScreen}
          options={{ title: 'Baños · Caja' }}
        />
        <Stack.Screen
          name="Billing"
          component={BillingScreen}
          options={{ title: 'Facturación POS' }}
        />
        <Stack.Screen
          name="Facturas"
          component={FacturasScreen}
          options={{ title: 'Facturas' }}
        />
        <Stack.Screen
          name="FacturaDetail"
          component={FacturaDetailScreen}
          options={{ title: 'Detalle factura' }}
        />
        <Stack.Screen
          name="Estadisticas"
          component={EstadisticasScreen}
          options={{ title: 'Estadísticas' }}
        />
        <Stack.Screen
          name="Usuarios"
          component={UsuariosScreen}
          options={{ title: 'Usuarios facturación' }}
        />
        <Stack.Screen
          name="HistorialCaja"
          component={HistorialCajaScreen}
          options={{ title: 'Historial torniquete' }}
        />
      </Stack.Navigator>
      <LateralDrawer visible={drawerOpen} onClose={closeDrawer}>
        <DrawerContent
          items={menuItems}
          onNavigate={handleNavigate}
          onClose={closeDrawer}
          onLogout={logout}
        />
      </LateralDrawer>
    </>
  );
}
