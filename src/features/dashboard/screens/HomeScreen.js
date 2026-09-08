import React, {useCallback} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {PromoCarousel} from '../components/PromoCarousel';
import {ModuleTile} from '../components/ModuleTile';
import {businessModules} from '../constants/businessModules';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing, typography} from '../../../theme';
import {useDashboardQuery} from '../hooks/useDashboardQuery';

const defaultDashboard = {
  user: {name: 'Rajesh'},
  overview: {
    receivables: 0,
    trucks: 0,
    parties: 0,
    pendingPods: 0,
  },
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const {data: dashboardData, refetch: refetchDashboard} = useDashboardQuery();

  useFocusEffect(
    useCallback(() => {
      refetchDashboard();
    }, [refetchDashboard]),
  );

  const dashboard = dashboardData || defaultDashboard;
  const {user, overview} = dashboard;

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Top Header Card (Receivables Header as shown in Image 2) */}
        <HeaderCard
          userName={user.name}
          receivables={overview.receivables || 0}
        />

        {/* 4 Premium Curved Cards (2x2 Grid) */}
        <PremiumMetricsGrid overview={overview} navigation={navigation} />

        {/* Promo Banner Carousel */}
        <View style={styles.promoSection}>
          <PromoCarousel />
        </View>

        {/* Manage Business Modules */}
        <ManageModulesGrid navigation={navigation} />
      </ScrollView>
    </AppScreen>
  );
}

/**
 * Top Header Card matching Image 2 reference:
 * - Left: Large bold Receivables Amount (e.g. ₹2,84,500) & Subtitle "Total Receivables"
 * - Right: Notification Bell icon button with red badge & User profile avatar
 */
function HeaderCard({userName, receivables}) {
  const initial = userName ? userName.charAt(0).toUpperCase() : 'R';

  return (
    <View style={styles.headerCard}>
      <View style={styles.headerRow}>
        {/* Left Side: Receivables Amount & Caption */}
        <View style={styles.receivablesGroup}>
          <AppText variant="heading" color="onInk" style={styles.receivablesAmount}>
            {formatCurrency(receivables)}
          </AppText>
          <AppText variant="caption" style={styles.receivablesLabel}>
            Total Receivables
          </AppText>
        </View>

        {/* Right Side: Notification Bell & Profile Avatar */}
        <View style={styles.headerActionsGroup}>
          <TouchableOpacity style={styles.iconCircleButton} accessibilityLabel="Notifications">
            <Icon name="bell-outline" size={20} color="#FFFFFF" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.avatarButton} accessibilityLabel="Profile">
            <AppText variant="label" style={styles.avatarText}>
              {initial}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * 4 Premium Curved Cards Grid:
 * 1. Total Vehicles
 * 2. Current Trips
 * 3. Total Parties
 * 4. Pending PODs
 */
function PremiumMetricsGrid({overview, navigation}) {
  const cardsData = [
    {
      key: 'vehicles',
      title: 'Total Vehicles',
      value: `${overview.trucks || 0} Vehicles`,
      subtitle: 'Fleet in Operation',
      icon: 'truck-outline',
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      route: routes.trucksList,
    },
    {
      key: 'trips',
      title: 'Current Trips',
      value: `${overview.activeTrips || 0} Active`,
      subtitle: 'Trips in Transit',
      icon: 'road-variant',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      route: routes.tripsList,
    },
    {
      key: 'parties',
      title: 'Total Parties',
      value: `${overview.parties || 0} Parties`,
      subtitle: 'Registered Khata',
      icon: 'account-group-outline',
      iconBg: '#FFF7ED',
      iconColor: '#F97316',
      route: routes.partiesList,
    },
    {
      key: 'pods',
      title: 'Pending PODs',
      value: `${overview.pendingPods || 0} Pending`,
      subtitle: 'PODs to Collect',
      icon: 'file-document-outline',
      iconBg: '#FDF2F8',
      iconColor: '#EC4899',
      route: routes.trips,
    },
  ];

  return (
    <View style={styles.metricsContainer}>
      <View style={styles.metricsGrid}>
        {cardsData.map(card => (
          <TouchableOpacity
            key={card.key}
            style={styles.metricCard}
            activeOpacity={0.7}
            onPress={() => {
              if (card.route) navigation.navigate(card.route);
            }}>
            {/* Top Row: Title & Icon Badge */}
            <View style={styles.cardTopRow}>
              <AppText variant="caption" color="textMuted" style={styles.cardTitle} numberOfLines={1}>
                {card.title}
              </AppText>
              <View style={[styles.cardIconBadge, {backgroundColor: card.iconBg}]}>
                <Icon name={card.icon} size={20} color={card.iconColor} />
              </View>
            </View>

            {/* Bottom Row: Value & Subtitle */}
            <View style={styles.cardBottomGroup}>
              <AppText variant="heading" style={styles.cardValue}>
                {card.value}
              </AppText>
              <AppText variant="caption" color="textMuted" style={styles.cardSubtitle}>
                {card.subtitle}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ManageModulesGrid({navigation}) {
  return (
    <View style={styles.modulesSection}>
      <AppText variant="heading" style={styles.sectionTitle}>
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
  scrollContainer: {
    paddingBottom: spacing.xl,
  },
  headerCard: {
    backgroundColor: colors.primary, // Deep Royal Navy Blue
    borderRadius: radius.lg + 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg + 4,
    marginHorizontal: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receivablesGroup: {
    gap: 2,
  },
  receivablesAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  receivablesLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13,
    fontWeight: '500',
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  iconCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentStrong,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  metricsContainer: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metricCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg + 4,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'space-between',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottomGroup: {
    gap: 2,
    marginTop: spacing.sm,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 11,
  },
  promoSection: {
    marginBottom: spacing.md,
  },
  modulesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});