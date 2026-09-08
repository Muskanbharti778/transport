import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const STATUS_STEPS = [
  'Started',
  'Completed',
  'POD Received',
  'POD Submitted',
  'Settled',
];

export function TripStatusStepper({currentStatus, timeline = [], onPress}) {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="View Trip Progress timeline">
      <View style={styles.stepsRow}>
        {STATUS_STEPS.map((step, idx) => {
          const isCompleted = idx <= currentIdx;
          const isLast = idx === STATUS_STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Step Circle & Label */}
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.circle,
                    isCompleted ? styles.circleCompleted : styles.circlePending,
                  ]}>
                  {isCompleted ? (
                    <Icon name="check" size={12} color={colors.surface} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                <AppText
                  variant="caption"
                  numberOfLines={2}
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                  ]}>
                  {step}
                </AppText>
              </View>

              {/* Connector Line */}
              {!isLast ? (
                <View
                  style={[
                    styles.line,
                    idx < currentIdx ? styles.lineCompleted : styles.linePending,
                  ]}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    width: 58,
    gap: 4,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: colors.success,
  },
  circlePending: {
    backgroundColor: '#D1D5DB',
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: 9,
    marginHorizontal: -4,
  },
  lineCompleted: {
    backgroundColor: colors.success,
  },
  linePending: {
    backgroundColor: '#E5E7EB',
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.textMuted,
    lineHeight: 12,
  },
  stepLabelCompleted: {
    color: colors.text,
    fontWeight: '600',
  },
});
