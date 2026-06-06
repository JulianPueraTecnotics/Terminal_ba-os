import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/AppContext';

interface HeaderRightActionsProps {
  onOpenMenu: () => void;
}

export function HeaderRightActions({ onOpenMenu }: HeaderRightActionsProps) {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 4 }}>
      <TouchableOpacity onPress={onOpenMenu} style={{ marginRight: 4 }} hitSlop={12}>
        <Ionicons name="menu" size={24} color={colors.headerText} />
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 4 }} hitSlop={12}>
        <Ionicons
          name={isDark ? 'sunny' : 'moon-outline'}
          size={24}
          color={colors.headerText}
        />
      </TouchableOpacity>
    </View>
  );
}
