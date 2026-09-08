import React from 'react';
import {StyleSheet, View} from 'react-native';
import {AppButton} from '../../../components/common/AppButton';
import {AppCard} from '../../../components/common/AppCard';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {spacing} from '../../../theme';

const actions = ['New Trip', 'Expense', 'Payment', 'Party', 'Truck', 'Driver'];

export default function AddScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Add"
        subtitle="Quick actions are staged here before the business modules are connected."
      />
      <View style={styles.list}>
        {actions.map(action => (
          <AppCard key={action} style={styles.actionCard}>
            <AppText variant="heading">{action}</AppText>
            <AppButton title="Open" variant="secondary" />
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  actionCard: {
    gap: spacing.md,
  },
});
