import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing} from '../../theme';
import {AppText} from './AppText';

export function AppHeader({title, subtitle}) {
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
      {subtitle ? (
        <AppText variant="body" color="textMuted" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  subtitle: {
    maxWidth: 320,
  },
});
