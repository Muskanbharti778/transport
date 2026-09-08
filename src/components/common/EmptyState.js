import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing} from '../../theme';
import {AppButton} from './AppButton';
import {AppText} from './AppText';

export function EmptyState({title, message, actionLabel, onAction}) {
  return (
    <View style={styles.container}>
      <AppText variant="heading" style={styles.centerText}>
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" style={styles.centerText}>
        {message}
      </AppText>
      {actionLabel ? <AppButton title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['4xl'],
  },
  centerText: {
    textAlign: 'center',
  },
});
