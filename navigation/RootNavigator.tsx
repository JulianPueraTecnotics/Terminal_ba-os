import React, { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth, useTheme } from '../contexts/AppContext';
import { LoginScreen } from '../screens/Login/LoginScreen';
import { OutOfScheduleScreen } from '../screens/OutOfSchedule/OutOfScheduleScreen';
import { MainNavigator } from './MainNavigator';
import type { AuthStackParamList, MainStackParamList } from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export function RootNavigator() {
  const { token, isLoading, outOfSchedule } = useAuth();
  const { colors } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<MainStackParamList>>(null);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const showMain = !!token && !outOfSchedule;

  return (
    <NavigationContainer ref={navigationRef}>
      {showMain ? (
        <MainNavigator navigationRef={navigationRef} />
      ) : (
        <AuthStack.Navigator
          initialRouteName={outOfSchedule ? 'OutOfSchedule' : 'Login'}
          screenOptions={{ headerShown: false }}
        >
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="OutOfSchedule" component={OutOfScheduleScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}
