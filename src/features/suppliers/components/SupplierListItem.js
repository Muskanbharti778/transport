import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

export function SupplierListItem({supplier, onPress}) {
  const active = Number(supplier.status) === 1;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconCircle}>
        <Icon name="domain" size={20} color={colors.textMuted} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <AppText variant="body" style={styles.name} numberOfLines={1}>
            {supplier.suppliername}
          </AppText>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: active ? colors.success : colors.textMuted},
            ]}
          />
        </View>
        <AppText variant="caption" color="textMuted">
          {supplier.mobile || supplier.contactperson || 'No contact'}
        </AppText>
        {supplier.address ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {supplier.address}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevron-right" size={20} color={colors.textMuted} />
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
});
