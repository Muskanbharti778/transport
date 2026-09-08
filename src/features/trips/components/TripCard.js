import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const statusConfig = {
  Started: {
    bg: colors.primarySoft,
    text: colors.primary,
    icon: 'truck-fast',
    label: 'Started',
  },
  Completed: {
    bg: '#FEF3C7',
    text: '#B45309',
    icon: 'check-circle-outline',
    label: 'Completed',
  },
  'POD Received': {
    bg: '#E0F2FE',
    text: '#0284C7',
    icon: 'file-document-outline',
    label: 'POD Received',
  },
  'POD Submitted': {
    bg: colors.primarySoft,
    text: colors.primary,
    icon: 'file-check-outline',
    label: 'POD Submitted',
  },
  Settled: {
    bg: colors.successSoft,
    text: colors.success,
    icon: 'check-decagram',
    label: 'Settled',
  },
};

export function TripCard({trip, onPress}) {
  const status = statusConfig[trip.status] || statusConfig.Started;
  const isSettled = trip.pendingBalance === 0 || trip.status === 'Settled';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Trip for ${trip.partyName}, truck ${trip.truckNumber}`}>
      
      {/* Header: Party Name & Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.partyContainer}>
          <AppText variant="body" style={styles.partyName} numberOfLines={1}>
            {trip.partyName}
          </AppText>
          {trip.lrNumber ? (
            <AppText variant="caption" color="textMuted" style={styles.lrNumber}>
              #{trip.lrNumber}
            </AppText>
          ) : null}
        </View>

        <View style={[styles.statusBadge, {backgroundColor: status.bg}]}>
          <Icon name={status.icon} size={13} color={status.text} />
          <AppText variant="caption" style={[styles.statusText, {color: status.text}]}>
            {status.label}
          </AppText>
        </View>
      </View>

      {/* Route & Truck Info */}
      <View style={styles.detailsRow}>
        <View style={styles.truckBadge}>
          <Icon name="truck-outline" size={14} color={colors.text} />
          <AppText variant="caption" style={styles.truckNumber}>
            {trip.truckNumber}
          </AppText>
        </View>

        <View style={styles.dateBadge}>
          <Icon name="calendar-month-outline" size={13} color={colors.textMuted} />
          <AppText variant="caption" color="textMuted">
            {trip.tripDate}
          </AppText>
        </View>
      </View>

      {/* Route Flow */}
      <View style={styles.routeRow}>
        <View style={styles.routePoint}>
          <View style={styles.originDot} />
          <AppText variant="body" style={styles.cityText} numberOfLines={1}>
            {trip.origin}
          </AppText>
        </View>

        <View style={styles.routeDivider}>
          <View style={styles.routeLine} />
          <Icon name="arrow-right" size={14} color={colors.textMuted} />
        </View>

        <View style={[styles.routePoint, styles.routePointRight]}>
          <View style={styles.destinationDot} />
          <AppText variant="body" style={styles.cityText} numberOfLines={1}>
            {trip.destination}
          </AppText>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Financial Footer */}
      <View style={styles.footerRow}>
        <View style={styles.freightBlock}>
          <AppText variant="caption" color="textMuted">
            Freight
          </AppText>
          <AppText variant="body" style={styles.freightAmount}>
            {formatCurrency(trip.freightAmount)}
          </AppText>
        </View>

        <View style={styles.balanceBlock}>
          <AppText variant="caption" color="textMuted">
            {isSettled ? 'Payment Status' : 'Pending Balance'}
          </AppText>
          <AppText
            variant="body"
            style={[
              styles.balanceAmount,
              {color: isSettled ? colors.success : colors.danger},
            ]}>
            {isSettled ? 'Settled' : formatCurrency(trip.pendingBalance)}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function formatCurrency(amount) {
  if (amount == null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  partyContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  partyName: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 15,
  },
  lrNumber: {
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  truckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  truckNumber: {
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
    fontSize: 12,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routePointRight: {
    justifyContent: 'flex-end',
  },
  originDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  destinationDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  cityText: {
    fontWeight: '600',
    fontSize: 13,
    color: colors.text,
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  routeLine: {
    width: 20,
    height: 1,
    backgroundColor: colors.border,
    marginRight: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  freightBlock: {
    gap: 2,
  },
  freightAmount: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
  },
  balanceBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balanceAmount: {
    fontWeight: '700',
    fontSize: 14,
  },
});
