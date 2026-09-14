import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const REPORTS = [
  {
    key: 'profit',
    title: 'Profit and Loss',
    icon: 'chart-line',
    color: colors.primary,
  },
  {
    key: 'trips',
    title: 'Trip Profitability',
    icon: 'truck-check-outline',
    color: colors.success,
  },
  {
    key: 'expenses',
    title: 'Expense Summary',
    icon: 'receipt-text-outline',
    color: '#B45309',
  },
  {
    key: 'outstanding',
    title: 'Outstanding Summary',
    icon: 'cash-clock',
    color: colors.danger,
  },
  {
    key: 'revenue',
    title: 'Revenue Report',
    icon: 'cash-plus',
    color: '#0F766E',
  },
  {
    key: 'drivers',
    title: 'Driver Report',
    icon: 'account-tie-outline',
    color: '#7C3AED',
  },
  {
    key: 'trucks',
    title: 'Truck Report',
    icon: 'truck-outline',
    color: '#0369A1',
  },
  {
    key: 'parties',
    title: 'Party Report',
    icon: 'account-group-outline',
    color: '#C2410C',
  },
];

const TRIPS = [
  {id: 1, trip: 'TRP-1024', party: 'ABC Transport', income: 50000, expense: 32000},
  {id: 2, trip: 'TRP-1025', party: 'Metro Logistics', income: 42000, expense: 28000},
  {id: 3, trip: 'TRP-1026', party: 'Sharma Traders', income: 38000, expense: 30000},
];

const EXPENSES = [
  {id: 1, type: 'Fuel', amount: 28000, category: 'Truck'},
  {id: 2, type: 'Toll', amount: 12500, category: 'Trip'},
  {id: 3, type: 'Maintenance', amount: 9500, category: 'Truck'},
  {id: 4, type: 'Driver Advance', amount: 8000, category: 'Trip'},
];

const OUTSTANDING = [
  {id: 1, name: 'ABC Transport', type: 'Party', amount: 45000, direction: 'To receive'},
  {id: 2, name: 'Sharma Suppliers', type: 'Supplier', amount: 12500, direction: 'To pay'},
  {id: 3, name: 'Ramesh Kumar', type: 'Driver', amount: 8000, direction: 'To pay'},
];

const REVENUE = [
  {id: 1, month: 'September 2026', trips: 18, amount: 130000},
  {id: 2, month: 'August 2026', trips: 22, amount: 158000},
  {id: 3, month: 'July 2026', trips: 16, amount: 112000},
];

const DRIVERS = [
  {id: 1, name: 'Ramesh Kumar', trips: 12, advance: 18000},
  {id: 2, name: 'Suresh Yadav', trips: 9, advance: 14000},
  {id: 3, name: 'Mohan Lal', trips: 7, advance: 9500},
];

const TRUCKS = [
  {id: 1, number: 'RJ14 AB 1234', trips: 10, income: 92000},
  {id: 2, number: 'RJ14 CD 5678', trips: 8, income: 76000},
  {id: 3, number: 'RJ14 EF 9012', trips: 6, income: 54000},
];

const PARTIES = [
  {id: 1, name: 'ABC Transport', bills: 8, outstanding: 45000},
  {id: 2, name: 'Metro Logistics', bills: 6, outstanding: 28000},
  {id: 3, name: 'Sharma Traders', bills: 5, outstanding: 18000},
];

function money(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export default function ReportsScreen() {
  const [activeReport, setActiveReport] = useState('profit');
  const [period, setPeriod] = useState('This month');

  const totals = useMemo(() => {
    const income = TRIPS.reduce((total, trip) => total + trip.income, 0);
    const tripExpenses = TRIPS.reduce((total, trip) => total + trip.expense, 0);
    const otherExpenses = EXPENSES.reduce((total, item) => total + item.amount, 0);

    return {
      income,
      expenses: tripExpenses + otherExpenses,
      profit: income - tripExpenses - otherExpenses,
      received: OUTSTANDING
        .filter(item => item.direction === 'To receive')
        .reduce((total, item) => total + item.amount, 0),
      payable: OUTSTANDING
        .filter(item => item.direction === 'To pay')
        .reduce((total, item) => total + item.amount, 0),
    };
  }, []);

  const report = REPORTS.find(item => item.key === activeReport);

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <AppText variant="title">Reports</AppText>
          <AppText variant="body" color="textMuted">
            Business performance at a glance
          </AppText>
        </View>

        <Icon name="file-chart-outline" size={32} color={colors.primary} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodRow}>
        {['Today', 'This week', 'This month', 'Custom'].map(item => (
          <TouchableOpacity
            key={item}
            onPress={() => setPeriod(item)}
            style={[
              styles.periodButton,
              period === item && styles.activePeriodButton,
            ]}>
            <AppText
              variant="label"
              style={period === item ? styles.activeText : styles.mutedText}>
              {item}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.summaryGrid}>
        <SummaryCard
          label="Income"
          amount={totals.income}
          icon="arrow-down-left"
          color={colors.success}
        />
        <SummaryCard
          label="Expenses"
          amount={totals.expenses}
          icon="arrow-up-right"
          color={colors.danger}
        />
        <SummaryCard
          label="Profit"
          amount={totals.profit}
          icon="chart-line"
          color={colors.primary}
        />
        <SummaryCard
          label="Outstanding"
          amount={totals.received + totals.payable}
          icon="cash-clock"
          color="#B45309"
        />
      </View>

      <View style={styles.reportTabs}>
        {REPORTS.map(item => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setActiveReport(item.key)}
            style={[
              styles.reportTab,
              activeReport === item.key && {
                backgroundColor: item.color,
                borderColor: item.color,
              },
            ]}>
            <Icon
              name={item.icon}
              size={18}
              color={
                activeReport === item.key ? colors.onInk : item.color
              }
            />
            <AppText
              variant="label"
              style={
                activeReport === item.key
                  ? styles.activeText
                  : {color: item.color}
              }>
              {item.title}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.reportHeader}>
        <View>
          <AppText variant="heading">{report.title}</AppText>
          <AppText variant="caption" color="textMuted">
            Report period: {period}
          </AppText>
        </View>

        <TouchableOpacity
          accessibilityLabel="Share report"
          style={styles.iconButton}>
          <Icon name="share-variant-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {activeReport === 'profit' && <ProfitReport totals={totals} />}
      {activeReport === 'trips' && <TripReport />}
      {activeReport === 'expenses' && <ExpenseReport />}
      {activeReport === 'outstanding' && (
        <OutstandingReport totals={totals} />
      )}
      {activeReport === 'revenue' && <RevenueReport />}
      {activeReport === 'drivers' && <DriverReport />}
      {activeReport === 'trucks' && <TruckReport />}
      {activeReport === 'parties' && <PartyReport />}
    </AppScreen>
  );
}

function SummaryCard({label, amount, icon, color}) {
  return (
    <View style={styles.summaryCard}>
      <Icon name={icon} size={21} color={color} />
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="heading" style={{color}}>
        {money(amount)}
      </AppText>
    </View>
  );
}

function ProfitReport({totals}) {
  return (
    <View style={styles.reportCard}>
      <ReportRow label="Total income" value={money(totals.income)} />
      <ReportRow label="Trip expenses" value={money(90000)} />
      <ReportRow label="Other expenses" value={money(58000)} />

      <View style={styles.divider} />

      <ReportRow
        label={totals.profit >= 0 ? 'Net profit' : 'Net loss'}
        value={money(Math.abs(totals.profit))}
        valueStyle={totals.profit >= 0 ? styles.successText : styles.dangerText}
        labelStyle={styles.boldText}
      />
    </View>
  );
}

function TripReport() {
  return (
    <View style={styles.reportCard}>
      {TRIPS.map(trip => {
        const profit = trip.income - trip.expense;

        return (
          <View key={trip.id} style={styles.listRow}>
            <View style={styles.rowIcon}>
              <Icon name="truck-outline" size={20} color={colors.primary} />
            </View>

            <View style={styles.rowInfo}>
              <AppText variant="label">{trip.trip}</AppText>
              <AppText variant="caption" color="textMuted">
                {trip.party}
              </AppText>
            </View>

            <View style={styles.rightInfo}>
              <AppText variant="label" style={styles.successText}>
                {money(profit)}
              </AppText>
              <AppText variant="caption" color="textMuted">
                Profit
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ExpenseReport() {
  return (
    <View style={styles.reportCard}>
      {EXPENSES.map(expense => (
        <View key={expense.id} style={styles.listRow}>
          <View style={styles.rowIcon}>
            <Icon name="receipt-text-outline" size={20} color="#B45309" />
          </View>

          <View style={styles.rowInfo}>
            <AppText variant="label">{expense.type}</AppText>
            <AppText variant="caption" color="textMuted">
              {expense.category} expense
            </AppText>
          </View>

          <AppText variant="label" style={styles.dangerText}>
            {money(expense.amount)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function OutstandingReport({totals}) {
  return (
    <View style={styles.reportCard}>
      <ReportRow
        label="Total to receive"
        value={money(totals.received)}
        valueStyle={styles.successText}
      />
      <ReportRow
        label="Total to pay"
        value={money(totals.payable)}
        valueStyle={styles.dangerText}
      />

      <View style={styles.divider} />

      {OUTSTANDING.map(item => (
        <View key={item.id} style={styles.listRow}>
          <View style={styles.rowInfo}>
            <AppText variant="label">{item.name}</AppText>
            <AppText variant="caption" color="textMuted">
              {item.type} • {item.direction}
            </AppText>
          </View>

          <AppText
            variant="label"
            style={
              item.direction === 'To receive'
                ? styles.successText
                : styles.dangerText
            }>
            {money(item.amount)}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function RevenueReport() {
  return (
    <View style={styles.reportCard}>
      {REVENUE.map(item => (
        <ReportListRow
          key={item.id}
          icon="cash-plus"
          iconColor="#0F766E"
          title={item.month}
          subtitle={`${item.trips} trips completed`}
          value={money(item.amount)}
        />
      ))}
    </View>
  );
}

function DriverReport() {
  return (
    <View style={styles.reportCard}>
      {DRIVERS.map(item => (
        <ReportListRow
          key={item.id}
          icon="account-tie-outline"
          iconColor="#7C3AED"
          title={item.name}
          subtitle={`${item.trips} trips • Advance given`}
          value={money(item.advance)}
        />
      ))}
    </View>
  );
}

function TruckReport() {
  return (
    <View style={styles.reportCard}>
      {TRUCKS.map(item => (
        <ReportListRow
          key={item.id}
          icon="truck-outline"
          iconColor="#0369A1"
          title={item.number}
          subtitle={`${item.trips} trips completed`}
          value={money(item.income)}
        />
      ))}
    </View>
  );
}

function PartyReport() {
  return (
    <View style={styles.reportCard}>
      {PARTIES.map(item => (
        <ReportListRow
          key={item.id}
          icon="account-group-outline"
          iconColor="#C2410C"
          title={item.name}
          subtitle={`${item.bills} bills • Outstanding`}
          value={money(item.outstanding)}
        />
      ))}
    </View>
  );
}

function ReportListRow({icon, iconColor, title, subtitle, value}) {
  return (
    <View style={styles.listRow}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowInfo}>
        <AppText variant="label">{title}</AppText>
        <AppText variant="caption" color="textMuted">
          {subtitle}
        </AppText>
      </View>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

function ReportRow({label, value, labelStyle, valueStyle}) {
  return (
    <View style={styles.reportRow}>
      <AppText variant="body" style={labelStyle}>
        {label}
      </AppText>
      <AppText variant="label" style={valueStyle}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  periodRow: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  periodButton: {
    minWidth: 70,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  activePeriodButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  activeText: {
    color: colors.onInk,
  },
  mutedText: {
    color: colors.textMuted,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    width: '48%',
    minHeight: 96,
    gap: 4,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  reportTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  reportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    width: '48%',
    minHeight: 46,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  reportCard: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
    backgroundColor: colors.border,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
  },
  rowInfo: {
    flex: 1,
    gap: 3,
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  successText: {
    color: colors.success,
  },
  dangerText: {
    color: colors.danger,
  },
  boldText: {
    fontWeight: '700',
  },
});