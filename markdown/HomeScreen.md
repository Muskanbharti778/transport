import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {PromoCarousel} from '../components/PromoCarousel';
import {ModuleTile} from '../components/ModuleTile';
import {businessModules} from '../constants/businessModules';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing, typography} from '../../../theme';

// TODO(backend): replace with TanStack Query once dashboard API contract exists.
const mockDashboard = {
  user: {name: 'Rajesh'},
  overview: {
    activeTrips: 12,
    receivables: 284500,
    trucks: 9,
  },
  fleetPerformance: {
    utilization: '78%',
    fuelEfficiency: '8.7 mpg',
    onTimeRate: '92%',
    idleTime: '1h 12m',
  },
  topDriver: {name: 'Lukas Weber', label: 'Top driver', rating: '9.7'},
  serviceAlert: {vehicleCount: 4, label: 'Needing service'},
};

// TODO(navigation): wire remaining actions once their feature screens/routes
// exist (Expenses, Payments, Trucks). Party and Trip are wired below.
const quickActions = [
  {key: 'trip', label: 'Add Trip', icon: 'truck-fast-outline'},
  {key: 'expense', label: 'Expense', icon: 'receipt'},
  {key: 'payment', label: 'Payment', icon: 'cash-multiple'},
  {key: 'party', label: 'Add Party', icon: 'account-group-outline'},
  {key: 'truck', label: 'Add Truck', icon: 'truck-plus-outline'},
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const {user, overview, fleetPerformance, topDriver, serviceAlert} = mockDashboard;

  const handleQuickAction = key => {
    if (key === 'party') {
      navigation.navigate(routes.addParty);
      return;
    }
    if (key === 'trip') {
      navigation.navigate(routes.addTrip);
      return;
    }
    // other actions still TODO until their screens exist
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CurvedHeader>
          <TopBar userName={user.name} />
          <AppText variant="body" style={styles.headerTagline}>
            Your business, at a glance
          </AppText>
        </CurvedHeader>

        <FloatingStatsCard overview={overview} />

        <View style={styles.whiteSection}>
          <QuickActionsCarousel actions={quickActions} onActionPress={handleQuickAction} />

          <PromoCarousel />

          {/* <FleetPerformanceCard
            metrics={fleetPerformance}
            topDriver={topDriver}
            serviceAlert={serviceAlert}
          /> */}

          <ManageModulesGrid navigation={navigation} />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function CurvedHeader({children}) {
  return <View style={styles.curvedHeader}>{children}</View>;
}

function TopBar({userName}) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Notifications">
        <Icon name="bell-outline" size={20} color={colors.text} />
        <View style={styles.notificationDot} />
      </TouchableOpacity>

      <AppText variant="heading" color="onInk" style={styles.brandText}>
        Hi, {userName}
      </AppText>

      <View style={styles.avatarPlaceholder}>
        <AppText variant="label" color="onInk">
          {userName?.charAt(0) ?? '?'}
        </AppText>
      </View>
    </View>
  );
}

function FloatingStatsCard({overview}) {
  return (
    <View style={styles.statsCard}>
      <StatColumn label="Active Trips" value={overview.activeTrips} />
      <View style={styles.statsDivider} />
      <StatColumn label="Receivables" value={formatCurrency(overview.receivables)} />
      <View style={styles.statsDivider} />
      <StatColumn label="Trucks" value={overview.trucks} />
    </View>
  );
}

function StatColumn({label, value}) {
  return (
    <View style={styles.statColumn}>
      <AppText variant="caption" color="textMuted">{label}</AppText>
      <AppText variant="heading" style={styles.statValue}>{value}</AppText>
    </View>
  );
}

function QuickActionsCarousel({actions, onActionPress}) {
  return (
    <View style={styles.carouselWrap}>
      <AppText variant="label" color="textMuted" style={styles.carouselLabel}>
        QUICK ACTIONS
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselRow}>
        {actions.map(action => (
          <TouchableOpacity
            key={action.key}
            style={styles.actionTile}
            accessibilityLabel={action.label}
            onPress={() => onActionPress(action.key)}>
            <View style={styles.actionIconCircle}>
              <Icon name={action.icon} size={22} color={colors.ink} />
            </View>
            <AppText variant="caption" style={styles.actionLabel} numberOfLines={1}>
              {action.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// function FleetPerformanceCard({metrics, topDriver, serviceAlert}) {
//   return (
//     <View style={styles.performanceCard}>
//       <AppText variant="heading" style={styles.performanceTitle}>
//         Fleet performance overview
//       </AppText>

//       <View style={styles.metricGrid}>
//         <MetricTile label="Utilization" value={metrics.utilization} />
//         <MetricTile label="Fuel Efficiency" value={metrics.fuelEfficiency} dark />
//         <MetricTile label="On-time Rate" value={metrics.onTimeRate} />
//         <MetricTile label="Idle Time" value={metrics.idleTime} />
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.driverRow}>
//         <View style={styles.driverAvatarPlaceholder}>
//           <AppText variant="label" color="onInk">
//             {topDriver.name.charAt(0)}
//           </AppText>
//         </View>
//         <View style={styles.driverInfo}>
//           <AppText variant="body" style={styles.driverName}>
//             {topDriver.name}
//           </AppText>
//           <AppText variant="caption" color="textMuted">
//             {topDriver.label}
//           </AppText>
//         </View>
//         <View style={styles.ratingBadge}>
//           <Icon name="star" size={12} color={colors.onInk} />
//           <AppText variant="label" color="onInk"> {topDriver.rating}</AppText>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       <TouchableOpacity style={styles.serviceRow}>
//         <Icon name="truck-alert-outline" size={20} color={colors.text} />
//         <View style={styles.serviceInfo}>
//           <AppText variant="body" style={styles.serviceCount}>
//             {serviceAlert.vehicleCount} vehicles
//           </AppText>
//           <AppText variant="caption" color="textMuted">
//             {serviceAlert.label}
//           </AppText>
//         </View>
//         <Icon name="chevron-right" size={20} color={colors.textMuted} />
//       </TouchableOpacity>
//     </View>
//   );
// }

function MetricTile({label, value, dark}) {
  return (
    <View style={[styles.metricTile, dark && styles.metricTileDark]}>
      <AppText variant="caption" color={dark ? 'onInk' : 'textMuted'}>
        {label}
      </AppText>
      <AppText variant="heading" color={dark ? 'onInk' : 'text'} style={styles.metricValue}>
        {value}
      </AppText>
    </View>
  );
}

function ManageModulesGrid({navigation}) {
  return (
    <View style={styles.modulesSection}>
      <AppText variant="heading" style={styles.performanceTitle}>
        Manage business
      </AppText>
      <View style={styles.modulesGrid}>
        {businessModules.map(module => (
          <ModuleTile
            key={module.key}
            label={module.label}
            icon={module.icon}
            ready={Boolean(module.route)}
            onPress={() => navigation.navigate(module.route)}
          />
        ))}
      </View>
    </View>
  );
}

function formatCurrency(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}

const styles = StyleSheet.create({
  curvedHeader: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.lg + 16,
    borderBottomRightRadius: radius.lg + 16,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + spacing.lg, // extra room for the floating card overlap
    marginHorizontal: -spacing.lg, // best-effort bleed — see note re: AppScreen padding
  },
  headerTagline: {
    color: 'rgba(255,255,255,0.85)',
  },
  whiteSection: {
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md + 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentStrong,
  },
  brandText: {
    fontSize: typography.sizes.md,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius.md + 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: -spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.sizes.md,
  },
  statsDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  carouselWrap: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  carouselLabel: {
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  carouselRow: {
    gap: spacing.sm,
  },
  actionTile: {
    width: 76,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    textAlign: 'center',
  },
  performanceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  performanceTitle: {
    marginBottom: spacing.md,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricTile: {
    width: '48%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricTileDark: {
    backgroundColor: colors.ink,
  },
  metricValue: {
    fontSize: typography.sizes.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  driverAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius.md + 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontWeight: typography.weights.semibold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceCount: {
    fontWeight: typography.weights.semibold,
  },
  modulesSection: {
    marginBottom: spacing.xl,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});