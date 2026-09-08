import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '../../theme';
import {AppText} from './AppText';

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      <AppText
        variant="label"
        style={[
          styles.text,
          variant === 'secondary' ? styles.secondaryText : styles.primaryText,
        ]}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.84,
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  primaryText: {
    color: colors.surface,
  },
  secondaryText: {
    color: colors.primaryDark,
  },
});
