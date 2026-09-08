import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors, radius, spacing} from '../../theme';
import {AppText} from '../common/AppText';

export function StatusBadge({label, tone = 'success'}) {
  const palette = toneMap[tone] || toneMap.success;

  return (
    <View style={[styles.badge, {backgroundColor: palette.background}]}>
      <AppText variant="caption" style={{color: palette.text}}>
        {label}
      </AppText>
    </View>
  );
}

const toneMap = {
  success: {
    background: colors.successSoft,
    text: colors.success,
  },
  warning: {
    background: colors.warningSoft,
    text: colors.warning,
  },
  danger: {
    background: colors.dangerSoft,
    text: colors.danger,
  },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
