import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

export function ModuleTile({label, icon, ready, onPress}) {
  return (
    <TouchableOpacity
      style={[styles.tile, !ready && styles.tileDisabled]}
      onPress={ready ? onPress : undefined}
      disabled={!ready}
      accessibilityLabel={label}
      accessibilityState={{disabled: !ready}}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={22} color={ready ? colors.ink : colors.textMuted} />
      </View>
      <AppText variant="caption" style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
      {!ready ? (
        <View style={styles.soonBadge}>
          <AppText variant="caption" style={styles.soonText}>
            Soon
          </AppText>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  tileDisabled: {
    opacity: 0.55,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md + 6,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
  soonBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  soonText: {
    fontSize: 9,
    color: colors.textMuted,
  },
});