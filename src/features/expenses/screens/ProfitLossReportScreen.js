import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {routes} from '../../../navigation/routeNames';
import {colors, spacing} from '../../../theme';

export default function ProfitLossReportScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const expenses = route.params?.expenses || [];

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );

  const totalIncome = 0;
  const profitOrLoss = totalIncome - totalExpenses;

  return (
    <AppScreen scroll contentStyle={styles.content}>
      <AppText variant="heading" style={styles.title}>
        Profit and Loss Report
      </AppText>

      <View style={styles.summary}>
        <View style={styles.row}>
          <AppText>Income</AppText>
          <AppText>₹{totalIncome.toLocaleString('en-IN')}</AppText>
        </View>

        <View style={styles.row}>
          <AppText>Expenses</AppText>
          <AppText>
            ₹{totalExpenses.toLocaleString('en-IN')}
          </AppText>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <AppText variant="heading">
            {profitOrLoss >= 0 ? 'Profit' : 'Loss'}
          </AppText>

          <AppText
            variant="heading"
            style={profitOrLoss >= 0 ? styles.profit : styles.loss}>
            ₹{Math.abs(profitOrLoss).toLocaleString('en-IN')}
          </AppText>
        </View>
      </View>

      <AppButton
        title="Add Trip"
        onPress={() => navigation.navigate(routes.addTrip)}
        style={styles.addTripButton}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
    color: colors.primary2,
  },
  summary: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
    backgroundColor: colors.border,
  },
  profit: {
    color: colors.success,
  },
  loss: {
    color: colors.danger,
  },
  addTripButton: {
    marginTop: spacing.xl,
  },
});