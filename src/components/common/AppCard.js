import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors, radius, shadows, spacing} from '../../theme';

export function AppCard({children, style}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    //padding: spacing.lg,
    ...shadows.card,
  },
});
