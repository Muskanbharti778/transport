import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {TripStatusSheet} from '../sheets/TripStatusSheet';
import {useTripDetailsQuery} from '../hooks/useTripDetailsQuery';
import {useUpdateTripStatusMutation} from '../hooks/useUpdateTripStatusMutation';
import {colors, radius, spacing} from '../../../theme';

const STATUS_ORDER = ['Started', 'Completed', 'POD Received', 'POD Submitted', 'Settled'];

export default function TripProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {tripId} = route.params || {};

  const {data: trip, isLoading, isError, refetch} = useTripDetailsQuery(tripId || 'TRIP-1001');
  const {mutateAsync: updateStatus, isPending} = useUpdateTripStatusMutation();
  const [statusSheet, setStatusSheet] = useState({visible: false, nextStatus: null});

  if (isLoading) {
    return (
      <AppScreen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="body" color="textMuted" style={styles.loadingText}>
          Loading trip progress...
        </AppText>
      </AppScreen>
    );
  }

  if (isError || !trip) {
    return (
      <AppScreen style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={48} color={colors.danger} />
        <AppText variant="body" color="danger">
          Could not load trip progress.
        </AppText>
        <AppButton title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
      </AppScreen>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(trip.status);

  const getNextAction = () => {
    switch (trip.status) {
      case 'Started':
        return {label: 'Complete Trip', nextStatus: 'Completed'};
      case 'Completed':
        return {label: 'Mark POD Received', nextStatus: 'POD Received'};
      case 'POD Received':
        return {label: 'Mark POD Submitted', nextStatus: 'POD Submitted'};
      case 'POD Submitted':
        return {label: 'Settle Party', nextStatus: 'Settled'};
      case 'Settled':
      default:
        return {label: 'Trip Fully Settled', nextStatus: null};
    }
  };

  const nextAction = getNextAction();

  const handleAdvanceStatus = async () => {
    if (!nextAction.nextStatus) return;
    const next = nextAction.nextStatus;
    // Status advances that need extra input (end km, dates, POD photo,
    // settlement amount/mode) open the sheet before calling the backend.
    const needsInput =
      next === 'Completed' ||
      next === 'POD Received' ||
      next === 'POD Submitted' ||
      next === 'Settled';
    if (needsInput) {
      setStatusSheet({visible: true, nextStatus: next});
      return;
    }
    await handleStatusConfirm({status: next, date: null, endKm: '', photoBase64: null});
  };

  const handleStatusConfirm = async payload => {
    setStatusSheet(prev => ({...prev, visible: false}));
    try {
      await updateStatus({id: trip.id, ...payload});
    } catch (error) {
      Alert.alert(
        'Status not updated',
        error?.message || 'Could not update the trip status. Please try again.',
      );
    }
  };

  const handleAttachPod = stepName => {
    Alert.alert(
      'Attach POD / Document',
      `Attach the ${stepName} photo when marking the next status. Use the "${
        nextAction.label
      }" button below — you can pick a photo from the camera or gallery, and it is sent to the backend with the status update.`,
    );
  };

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackBtn}
          accessibilityLabel="Back">
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <AppText variant="heading" style={styles.headerTitle}>
          Trip Progress
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Top Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.fieldBlock}>
            <AppText variant="caption" color="textMuted">
              Party/Customer Name
            </AppText>
            <AppText variant="heading" style={styles.partyName}>
              {trip.partyName}
            </AppText>
          </View>

          <View style={styles.fieldBlock}>
            <AppText variant="caption" color="textMuted">
              Truck No.
            </AppText>
            <View style={styles.truckRow}>
              <AppText variant="body" style={styles.truckNumber}>
                {trip.truckNumber}
              </AppText>
              <View style={styles.blueDot} />
            </View>
          </View>

          {/* Route Flow */}
          <View style={styles.routeContainer}>
            <AppText variant="caption" color="textMuted" style={styles.routeHeaderLabel}>
              Route
            </AppText>

            <View style={styles.routeTimeline}>
              {/* Origin */}
              <View style={styles.routeTimelineItem}>
                <View style={styles.originCircle} />
                <View style={styles.routeCityRow}>
                  <AppText variant="body" style={styles.cityName}>
                    {trip.origin}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    • {trip.tripDate}
                  </AppText>
                </View>
              </View>

              {/* Vertical line between cities */}
              <View style={styles.routeVerticalLine} />

              {/* Destination */}
              <View style={styles.routeTimelineItem}>
                <View style={styles.destinationCircle} />
                <View style={styles.routeCityRow}>
                  <AppText variant="body" style={styles.cityName}>
                    {trip.destination}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Financial summary row */}
          <View style={styles.financialRow}>
            <View>
              <AppText variant="caption" color="textMuted">
                Freight Amount
              </AppText>
              <AppText variant="body" style={styles.freightValue}>
                ₹{trip.freightAmount.toLocaleString('en-IN')}
              </AppText>
            </View>

            <View style={styles.balanceBlock}>
              <AppText variant="caption" color="textMuted">
                Party Balance
              </AppText>
              <AppText variant="body" style={styles.partyBalanceValue}>
                ₹{trip.pendingBalance.toLocaleString('en-IN')}
              </AppText>
            </View>
          </View>
        </View>

        {/* Vertical Progress Timeline Card */}
        <View style={styles.timelineCard}>
          {STATUS_ORDER.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isLast = idx === STATUS_ORDER.length - 1;
            const timelineEntry = (trip.statusTimeline || []).find(t => t.status === step);

            return (
              <View key={step} style={styles.timelineRow}>
                {/* Left Indicator & Connector Line */}
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.statusCircle,
                      isCompleted ? styles.statusCircleCompleted : styles.statusCirclePending,
                    ]}>
                    {isCompleted ? (
                      <Icon name="check" size={14} color={colors.surface} />
                    ) : null}
                  </View>
                  {!isLast ? (
                    <View
                      style={[
                        styles.timelineConnector,
                        idx < currentIdx ? styles.connectorCompleted : styles.connectorPending,
                      ]}
                    />
                  ) : null}
                </View>

                {/* Right Step Details */}
                <View style={styles.stepDetailsCol}>
                  <View style={styles.stepTitleRow}>
                    <AppText
                      variant="body"
                      style={[
                        styles.stepName,
                        isCompleted && styles.stepNameCompleted,
                      ]}>
                      {step}
                    </AppText>
                    {isCompleted && timelineEntry?.date ? (
                      <AppText variant="caption" color="textMuted">
                        {timelineEntry.date}
                      </AppText>
                    ) : null}
                  </View>

                  {/* Attachment Box for POD / Active Step */}
                  {isCompleted && idx === 0 ? (
                    <TouchableOpacity
                      style={styles.attachmentBox}
                      onPress={() => handleAttachPod(step)}
                      activeOpacity={0.7}>
                      <Icon name="camera-plus-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  ) : null}

                  {isCompleted && (step === 'POD Received' || step === 'POD Submitted') ? (
                    <TouchableOpacity
                      style={styles.podAttachmentBox}
                      onPress={() => handleAttachPod(step)}
                      activeOpacity={0.7}>
                      <Icon name="file-image-outline" size={22} color={colors.primary} />
                      <AppText variant="caption" style={styles.podAttachmentText}>
                        {timelineEntry?.podUrl ? 'POD Attached (Tap to change)' : 'Attach POD Photo'}
                      </AppText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>

      {/* Fixed Bottom Action Button */}
      <View style={styles.footerContainer}>
        <AppButton
          title={isPending ? 'Updating...' : nextAction.label}
          onPress={handleAdvanceStatus}
          disabled={!nextAction.nextStatus || isPending}
          style={styles.actionBtn}
        />
      </View>

      {/* Status Advance Sheet */}
      <TripStatusSheet
        visible={statusSheet.visible}
        status={statusSheet.nextStatus}
        onConfirm={handleStatusConfirm}
        onClose={() => setStatusSheet(prev => ({...prev, visible: false}))}
        isPending={isPending}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    padding: 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    marginTop: spacing.xs,
  },
  retryBtn: {
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldBlock: {
    gap: 2,
  },
  partyName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  truckNumber: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  routeContainer: {
    gap: spacing.xs,
  },
  routeHeaderLabel: {
    fontWeight: '600',
  },
  routeTimeline: {
    paddingLeft: spacing.xs,
  },
  routeTimelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  originCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
  },
  destinationCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.textMuted,
    backgroundColor: colors.surface,
  },
  routeVerticalLine: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 4,
  },
  routeCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityName: {
    fontWeight: '600',
    fontSize: 14,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  freightValue: {
    fontWeight: '700',
    fontSize: 15,
  },
  balanceBlock: {
    alignItems: 'flex-end',
  },
  partyBalanceValue: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.primary,
  },
  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  statusCircle: {
    width: 22,
    height: 22,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  statusCircleCompleted: {
    backgroundColor: colors.success,
  },
  statusCirclePending: {
    backgroundColor: '#D1D5DB',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  connectorCompleted: {
    backgroundColor: colors.success,
  },
  connectorPending: {
    backgroundColor: '#E5E7EB',
  },
  stepDetailsCol: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  stepNameCompleted: {
    fontWeight: '700',
    color: colors.text,
  },
  attachmentBox: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  podAttachmentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  podAttachmentText: {
    color: colors.primary,
    fontWeight: '600',
  },
  footerContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
});
