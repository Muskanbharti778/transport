import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useTripsQuery} from '../hooks/useTripsQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

export default function TripsListScreen() {
  const navigation = useNavigation();
  const {data: trips = [], isLoading} = useTripsQuery();

  const hasTrips = trips.length > 0;

  if (isLoading) {
    return (
      <AppScreen style={styles.center}>
        <AppText>Loading trips...</AppText>
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <AppText variant="title" style={styles.title}>
          Trips
        </AppText>

        {hasTrips ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate(routes.addTrip)}
            accessibilityLabel="Add trip">
            <Icon name="plus" size={24} color={colors.surface} />
          </TouchableOpacity>
        ) : null}
      </View>

      {!hasTrips ? (
        <View style={styles.emptyState}>
          <Icon name="truck-fast-outline" size={60} color={colors.primary} />

          <AppText variant="heading" style={styles.emptyTitle}>
            No trips yet
          </AppText>

          <AppText color="textMuted" style={styles.description}>
            Add customer, truck, route, billing and freight details.
          </AppText>

          <AppButton
            title="Create your first trip"
            onPress={() => navigation.navigate(routes.addTrip)}
          />
        </View>
      ) : (
        <>
          <AppText color="textMuted" style={styles.count}>
            {trips.length} trip{trips.length === 1 ? '' : 's'}
          </AppText>

          {trips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate(routes.tripDetails, {
                  tripId: trip.id,
                })
              }>
              <View style={styles.cardHeader}>
                <AppText variant="heading">
                  {trip.partyName || 'No Party'}
                </AppText>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </View>

              <AppText color="textMuted">
                {trip.origin || 'Origin'} to {trip.destination || 'Destination'}
              </AppText>

              <View style={styles.cardFooter}>
                <AppText color="textMuted">
                  {trip.truckNumber || 'Truck not assigned'}
                </AppText>

                <AppText style={styles.amount}>
                  Rs {Number(trip.freightAmount || 0).toLocaleString('en-IN')}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.primary2,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.round,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['3xl'],
  },
  emptyTitle: {
    marginVertical: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  count: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardFooter: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
  },
  amount: {
    color: colors.primary2,
    fontWeight: '700',
  },
});