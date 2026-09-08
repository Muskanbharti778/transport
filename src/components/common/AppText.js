import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {colors, typography} from '../../theme';

export function AppText({children, variant = 'body', color = 'text', style}) {
  return (
    <Text style={[styles.base, styles[variant], {color: colors[color]}, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fontFamily,
    color: colors.text,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    lineHeight: 34,
  },
  heading: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    lineHeight: 28,
  },
  body: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.regular,
    lineHeight: 24,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    lineHeight: 16,
  },
});
