import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

export const TRIP_STATUS_OPTIONS = [
  'All',
  'Started',
  'Completed',
  'POD Received',
  'POD Submitted',
  'Settled',
];

export function TripStatusFilter({selectedStatus, onSelectStatus, counts = {}}) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {TRIP_STATUS_OPTIONS.map(status => {
          const isSelected = selectedStatus === status;
          const count = counts[status];

          return (
            <TouchableOpacity
              key={status}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelectStatus(status)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{selected: isSelected}}>
              <AppText
                variant="label"
                style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                {status}
              </AppText>
              {count != null ? (
                <View
                  style={[
                    styles.countBadge,
                    isSelected && styles.countBadgeSelected,
                  ]}>
                  <AppText
                    variant="caption"
                    style={[
                      styles.countText,
                      isSelected && styles.countTextSelected,
                    ]}>
                    {count}
                  </AppText>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pillTextSelected: {
    color: colors.surface,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceMuted,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  countTextSelected: {
    color: colors.surface,
  },
});
