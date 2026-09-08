import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const statusStyles = {
  has_to_get: {bg: 'transparent', text: colors.danger, label: 'To Receive'},
  has_to_pay: {bg: 'transparent', text: colors.success, label: 'To Pay'},
  zero: {bg: 'transparent', text: colors.textMuted, label: 'No Balance'},
};

export function DriverListItem({driver, onPress}) {
  const active = Number(driver.status) === 1;
  const balanceType = driver.balance_type;

  let status = statusStyles[balanceType] || statusStyles.has_to_pay;
  if (!Number(driver.opening_balance)) {
    status = statusStyles.zero;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <Icon name="account-tie-outline" size={20} color={colors.textMuted} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <AppText variant="body" style={styles.name} numberOfLines={1}>
            {driver.drivername}
          </AppText>
          <View style={[styles.statusDot, {backgroundColor: active ? colors.success : colors.textMuted}]} />
        </View>
        <AppText variant="caption" color="textMuted">
          {driver.mobile || 'No mobile'}
        </AppText>
      </View>
      <View style={styles.amountBlock}>
        <AppText variant="body" style={styles.amount}>
          {formatBalance(driver.opening_balance)}
        </AppText>
        <View style={[styles.statusChip, {backgroundColor: status.bg}]}>
          <AppText variant="caption" style={{color: status.text}}>
            {status.label}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatBalance(value) {
  const num = Number(value) || 0;
  return `${num < 0 ? '' : '₹'}${Math.abs(num).toLocaleString('en-IN')}`;
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontWeight: '600',
    flexShrink: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  amountBlock: {
    alignItems: 'stretch',
    gap: spacing.xs,
  },
  amount: {
    fontWeight: '600',
    textAlign: 'right',
    alignSelf: 'stretch',
  },
  statusChip: {
    paddingLeft: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: 'stretch',
    alignItems: 'flex-end',
  },
});
