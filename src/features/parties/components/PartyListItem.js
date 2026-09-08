import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const statusStyles = {
  receivable: {bg: colors.dangerSoft, text: colors.danger, label: 'Receivable'},
  paid: {bg: colors.successSoft, text: colors.success, label: 'Paid'},
  pending: {bg: colors.surfaceMuted, text: colors.textMuted, label: 'Pending Review'},
};

export function PartyListItem({party, onPress}) {
  const status = statusStyles[party.balanceType] || statusStyles.pending;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Icon name="domain" size={20} color={colors.textMuted} />
      </View>
      <View style={styles.info}>
        <AppText variant="body" style={styles.name} numberOfLines={1}>
          {party.name}
        </AppText>
        <AppText variant="caption" color="textMuted">
          ID: {party.id} • {party.category}
        </AppText>
      </View>
      <View style={styles.amountBlock}>
        <AppText variant="body" style={[styles.amount, {color: status.text}]}>
          {formatCurrency(party.balance)}
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

function formatCurrency(value) {
  if (!value) return '₹0';
  return `₹${value.toLocaleString('en-IN')}`;
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
  },
  name: {
    fontWeight: '600',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
});