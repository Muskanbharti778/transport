import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const statusStyles = {
  available: {bg: colors.successSoft, text: colors.success, label: 'Available'},
  on_trip: {bg: colors.primarySoft, text: colors.primary, label: 'On Trip'},
  maintenance: {bg: colors.warningSoft, text: colors.warning, label: 'Maintenance'},
};

export function TruckListItem({truck, onPress}) {
  const status = statusStyles[truck.status] || statusStyles.maintenance;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <Icon name="truck-outline" size={20} color={colors.textMuted} />
      </View>
      <View style={styles.info}>
        <AppText variant="body" style={styles.name} numberOfLines={1}>
          {truck.vehicleNumber}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {truck.vehicleTypeName || 'Truck'}
          {truck.ownership === 'market' ? ' • Market' : ''}
        </AppText>
      </View>
      <View style={styles.chip}>
        <AppText variant="caption" style={{color: status.text}}>
          {status.label}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md + 10,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontWeight: '600',
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});
