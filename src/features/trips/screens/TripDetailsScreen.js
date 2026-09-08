import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQueries} from '@tanstack/react-query';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {TripStatusStepper} from '../components/TripStatusStepper';
import {AddAdvanceSheet} from '../sheets/AddAdvanceSheet';
import {AddChargeSheet} from '../sheets/AddChargeSheet';
import {AddDriverBalanceSheet} from '../sheets/AddDriverBalanceSheet';
import {AddExpenseSheet} from '../sheets/AddExpenseSheet';
import {AddPaymentSheet} from '../sheets/AddPaymentSheet';
import {TripStatusSheet} from '../sheets/TripStatusSheet';
import {useTripDetailsQuery} from '../hooks/useTripDetailsQuery';
import {useTripsQuery} from '../hooks/useTripsQuery';
import {tripsApi} from '../trips.api';
import {useUpdateTripStatusMutation} from '../hooks/useUpdateTripStatusMutation';
import {useAddAdvanceMutation} from '../hooks/useAddAdvanceMutation';
import {useAddChargeMutation} from '../hooks/useAddChargeMutation';
import {useAddDriverBalanceMutation} from '../hooks/useAddDriverBalanceMutation';
import {useAddExpenseMutation} from '../hooks/useAddExpenseMutation';
import {useAddPaymentMutation} from '../hooks/useAddPaymentMutation';
import {usePartiesQuery} from '../../parties/hooks/usePartiesQuery';
import {useTrucksQuery} from '../../trucks/hooks/useTrucksQuery';
import {useSuppliersQuery} from '../../suppliers/hooks/useSuppliersQuery';
import {useDriversQuery} from '../../drivers/hooks/useDriversQuery';
import {useCitiesQuery} from '../../cities/hooks/useCitiesQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

const STATIC_TABS = ['Profit', 'Driver', 'More'];

export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {tripId} = route.params || {};

  const [activeTab, setActiveTab] = useState('Party');
  const [advanceSheetVisible, setAdvanceSheetVisible] = useState(false);
  const [chargeSheetVisible, setChargeSheetVisible] = useState(false);
  const [driverBalanceVisible, setDriverBalanceVisible] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
  const [expenseSheetVisible, setExpenseSheetVisible] = useState(false);
  const [statusSheet, setStatusSheet] = useState({visible: false, nextStatus: null});
  const [expandedLoadId, setExpandedLoadId] = useState(null);
  const [targetTrip, setTargetTrip] = useState(null);

  const {data: trip, isLoading, isError, refetch} = useTripDetailsQuery(tripId || 'TRIP-1001');
  const {data: allTrips = []} = useTripsQuery();
  const {data: parties = []} = usePartiesQuery();
  const {data: trucks = []} = useTrucksQuery();
  const {data: suppliers = []} = useSuppliersQuery();
  const {data: drivers = []} = useDriversQuery();
  const {data: cities = []} = useCitiesQuery();
  const {mutateAsync: updateStatus, isPending: isUpdatingStatus} = useUpdateTripStatusMutation();
  const {mutateAsync: addAdvance, isPending: isAddingAdvance} = useAddAdvanceMutation();
  const {mutateAsync: addCharge, isPending: isAddingCharge} = useAddChargeMutation();
  const {mutateAsync: addDriverBalance, isPending: isAddingDriverBalance} = useAddDriverBalanceMutation();
  const {mutateAsync: addPayment, isPending: isAddingPayment} = useAddPaymentMutation();
  const {mutateAsync: addExpense, isPending: isAddingExpense} = useAddExpenseMutation();

  // Backend trip rows return integer FKs (partyid/truckid/driverid/originid/
  // destinationid, supplierid) but not display names, so join the shared
  // reference lists to resolve them for rendering.
  const displayTrip = useMemo(() => {
    if (!trip) return null;
    const partyById = new Map(parties.map(p => [String(p.id), p.name]));
    const truckById = new Map(trucks.map(t => [String(t.id), t.vehicleNumber]));
    const driverById = new Map(drivers.map(d => [String(d.id), d.drivername]));
    const cityById = new Map(cities.map(c => [String(c.id), c.name]));
    const supplierById = new Map(
      suppliers.map(s => [String(s.id), s.suppliername || s.name || '']),
    );
    const truck = trucks.find(t => String(t.id) === String(trip.truckId));
    // Resolve the market-truck supplier name from the suppliers list by the
    // trip's supplierid. Backend truck rows carry no supplier name and default
    // ownerName to 'Vehicle Owner', so never fall back to that for display.
    const truckSupplierName = truck?.supplierName || truck?.ownerName || '';
    return {
      ...trip,
      partyName:
        trip.partyName ||
        (trip.partyId && partyById.get(trip.partyId)) ||
        'No Party',
      truckNumber:
        (trip.truckId && truckById.get(trip.truckId)) ||
        (trip.truckNumber && trip.truckNumber !== 'Commercial Truck' ? trip.truckNumber : '') ||
        'Unassigned',
      driverName:
        (trip.driverId && driverById.get(trip.driverId)) ||
        (trip.driverName && trip.driverName !== 'Driver' ? trip.driverName : '') ||
        'Unassigned',
      supplierName:
        (trip.supplierId && supplierById.get(String(trip.supplierId))) ||
        (truckSupplierName && truckSupplierName !== 'Vehicle Owner' ? truckSupplierName : ''),
      origin: trip.origin || (trip.originId && cityById.get(trip.originId)) || 'Origin',
      destination:
        trip.destination || (trip.destinationId && cityById.get(trip.destinationId)) || 'Destination',
    };
  }, [trip, parties, trucks, drivers, cities, suppliers]);

  // A follow-up load inherits its parent's referenceno, so all trips sharing
  // one reference are "loads" of the same trip. When more than one exists the
  // first tab becomes "Loads".
  const loads = useMemo(() => {
    if (!displayTrip) return [];
    if (!displayTrip.referenceNo) return [displayTrip];
    const grouped = allTrips.filter(t => t.referenceNo === displayTrip.referenceNo);
    if (grouped.length === 0) return [displayTrip];
    return [...grouped].sort((a, b) => new Date(b.tripDate) - new Date(a.tripDate) || b.id.localeCompare(a.id));
  }, [displayTrip, allTrips]);

  // Fetch each load's full detail (advance + charge entries and computed
  // totals) so the grouped Loads tab shows real stored amounts even though the
  // trips list rows only carry bare trip data.
  const loadDetailResults = useQueries({
    queries: loads.map(load => ({
      queryKey: ['trip', load.id],
      queryFn: () => tripsApi.getTripById(load.id),
      enabled: activeTab === 'Loads',
      staleTime: 15000,
      retry: 1,
    })),
  });

  const displayLoads = useMemo(() => {
    if (!loads || loads.length === 0) return [];
    const partyById = new Map(parties.map(p => [String(p.id), p.name]));
    const truckById = new Map(trucks.map(t => [String(t.id), t.vehicleNumber]));
    const driverById = new Map(drivers.map(d => [String(d.id), d.drivername]));
    const cityById = new Map(cities.map(c => [String(c.id), c.name]));
    const supplierById = new Map(
      suppliers.map(s => [String(s.id), s.suppliername || s.name || '']),
    );
    // The grouped loads come from the trips list, whose rows carry no
    // advance/charge totals. Overlay the fetched per-load detail (entry lists +
    // computed money) so the stored backend amounts actually display.
    const loadDetailById = new Map();
    loadDetailResults.forEach((result, index) => {
      if (result.data) {
        loadDetailById.set(loads[index]?.id, result.data);
      }
    });
    return loads.map(l => {
      const truck = trucks.find(trk => String(trk.id) === String(l.truckId));
      const truckSupplierName = truck?.supplierName || truck?.ownerName || '';
      const detail = loadDetailById.get(l.id);
      return {
        ...l,
        ...(detail
          ? {
              freightAmount: Number(detail.freightAmount) || Number(l.freightAmount) || 0,
              advanceAmount: Number(detail.advanceAmount) || 0,
              chargesAmount: Number(detail.chargesAmount) || 0,
              paymentsAmount: Number(detail.paymentsAmount) || 0,
              pendingBalance: Number(detail.pendingBalance) || 0,
              advances: detail.advances || [],
              charges: detail.charges || [],
              expenses: detail.expenses || [],
            }
          : {
              freightAmount: Number(l.freightAmount) || 0,
              advanceAmount: Number(l.advanceAmount) || 0,
              chargesAmount: Number(l.chargesAmount) || 0,
              paymentsAmount: Number(l.paymentsAmount) || 0,
              pendingBalance:
                l.pendingBalance !== undefined
                  ? Number(l.pendingBalance)
                  : Number(l.freightAmount || 0) -
                    Number(l.advanceAmount || 0) +
                    Number(l.chargesAmount || 0) -
                    Number(l.paymentsAmount || 0),
            }),
        partyName:
          l.partyName ||
          (l.partyId && partyById.get(String(l.partyId))) ||
          'No Party',
        truckNumber:
          (l.truckId && truckById.get(String(l.truckId))) ||
          (l.truckNumber && l.truckNumber !== 'Commercial Truck' ? l.truckNumber : '') ||
          'Unassigned',
        driverName:
          (l.driverId && driverById.get(String(l.driverId))) ||
          (l.driverName && l.driverName !== 'Driver' ? l.driverName : '') ||
          'Unassigned',
        supplierName:
          (l.supplierId && supplierById.get(String(l.supplierId))) ||
          (truckSupplierName && truckSupplierName !== 'Vehicle Owner' ? truckSupplierName : ''),
        origin: l.origin || (l.originId && cityById.get(String(l.originId))) || 'Origin',
        destination:
          l.destination || (l.destinationId && cityById.get(String(l.destinationId))) || 'Destination',
      };
    });
  }, [loads, loadDetailResults, parties, trucks, drivers, cities, suppliers]);

  const hasMultipleLoads = loads.length > 1;
  const tabs = useMemo(
    () => [...(hasMultipleLoads ? ['Loads'] : ['Party']), ...STATIC_TABS],
    [hasMultipleLoads],
  );

  // Active context for modal sheets (target load or current trip)
  const activeLoadContext = targetTrip || displayTrip;

  // Keep the selected tab valid when the tab label flips between Party and
  // Loads based on how many trips share this reference.
  useEffect(() => {
    if (activeTab === 'Party' && !tabs.includes('Party')) {
      setActiveTab('Loads');
    } else if (activeTab === 'Loads' && !tabs.includes('Loads')) {
      setActiveTab('Party');
    }
  }, [tabs, activeTab]);

  // Unified line items for the Party tab's Charges field: every charge entry plus
  // every expense flagged "Add to Party Bill". Displayed as date · type · amount.
  const billLineItems = useMemo(() => {
    if (!trip) return [];
    const chargeItems = (trip.charges || []).map(c => ({
      id: `charge-${c.id || Date.now()}`,
      date: c.date || '',
      label: c.chargeType || c.type || 'Charge',
      amount: Number(c.amount) || 0,
      reduce: (c.billAdjustment || 'add') === 'reduce',
    }));
    const expenseItems = (trip.expenses || [])
      .filter(e => e.addToBill)
      .map(e => ({
        id: `expense-${e.id || Date.now()}`,
        date: e.date || '',
        label: e.type || 'Expense',
        amount: Number(e.amount) || 0,
        reduce: false,
      }));
    return [...chargeItems, ...expenseItems];
  }, [trip]);

  if (isLoading) {
    return (
      <AppScreen style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AppText variant="body" color="textMuted" style={styles.loadingText}>
          Loading trip details...
        </AppText>
      </AppScreen>
    );
  }

  if (isError || !displayTrip) {
    return (
      <AppScreen style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={48} color={colors.danger} />
        <AppText variant="body" color="danger">
          Could not load trip details.
        </AppText>
        <AppButton title="Retry" onPress={() => refetch()} style={styles.retryBtn} />
      </AppScreen>
    );
  }

  const handleNextStatus = async (targetLoad = null) => {
    const active = targetLoad || displayTrip;
    setTargetTrip(active);
    const sequence = ['Started', 'Completed', 'POD Received', 'POD Submitted', 'Settled'];
    const currentIdx = sequence.indexOf(active.status);
    if (currentIdx >= sequence.length - 1) {
      return;
    }
    const next = sequence[currentIdx + 1];
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
    await handleStatusConfirm({status: next, date: null, endKm: '', photoBase64: null}, active);
  };

  const handleStatusConfirm = async (payload, targetLoad = null) => {
    const active = targetLoad || targetTrip || displayTrip;
    setStatusSheet(prev => ({...prev, visible: false}));
    try {
      await updateStatus({id: active.id, ...payload});
      setTargetTrip(null);
    } catch (error) {
      Alert.alert(
        'Status not updated',
        error?.message || 'Could not update the trip status. Please try again.',
      );
    }
  };

  const handleSaveAdvance = async data => {
    // Include the trip + party/supplier context the AdvanceEntryController expects.
    const active = activeLoadContext;
    const isSupplier = data.advancetype === 'supplier';
    await addAdvance({
      id: active.id,
      ...data,
      partyId: isSupplier ? null : active.partyId,
      supplierId: isSupplier ? active.supplierId : null,
      driverId: active.driverId,
    });
    setAdvanceSheetVisible(false);
    setTargetTrip(null);
  };

  const handleSaveCharge = async data => {
    // Pass the charge entry through to the ChargeEntryController. The sheet
    // resolves cid (charge type id) and chargetype ('party'/'supplier').
    const active = activeLoadContext;
    await addCharge({
      id: active.id,
      ...data,
    });
    setChargeSheetVisible(false);
    setTargetTrip(null);
  };

  const handleSaveDriverBalance = async data => {
    const active = activeLoadContext;
    await addDriverBalance({id: active.id, ...data});
    setDriverBalanceVisible(false);
    setTargetTrip(null);
  };

  const handleSavePayment = async data => {
    const active = activeLoadContext;
    await addPayment({tripId: active.id, payload: data});
    setPaymentSheetVisible(false);
    setTargetTrip(null);
  };

  const handleSaveExpense = async data => {
    const active = activeLoadContext;
    await addExpense({
      id: active.id,
      ...data,
    });
    setExpenseSheetVisible(false);
    setTargetTrip(null);
  };

  // Calculations for Profit Tab
  const totalRevenue = (displayTrip.freightAmount || 0) + (displayTrip.chargesAmount || 0);
  const totalExpenses = (displayTrip.expenses || []).reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  // A bill is only meaningful once the trip is beyond the Started stage.
  const canViewBill = ['Completed', 'POD Received', 'POD Submitted', 'Settled'].includes(
    displayTrip.status,
  );

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconBtn}
            accessibilityLabel="Back">
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <AppText variant="heading" style={styles.headerTitle}>
            Trip Details
          </AppText>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate(routes.addTrip, {trip})}
            accessibilityLabel="Edit Trip">
            <AppText variant="label" style={styles.editText}>
              Edit
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Help Video">
            <Icon name="youtube" size={24} color="#FF0000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="More Options">
            <Icon name="dots-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Vehicle Card Banner */}
      <View style={styles.vehicleBanner}>
        <View style={styles.vehicleRow}>
          <Icon name="truck" size={20} color={colors.text} />
          <AppText variant="body" style={styles.truckNumber}>
            {displayTrip.truckNumber}
          </AppText>
          {displayTrip.driverName ? (
            <AppText variant="caption" color="textMuted" style={styles.driverSubText}>
              • {displayTrip.driverName}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* Tabs Header */}
      <View style={styles.tabsContainer}>
        {tabs.map(tab => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isSelected && styles.tabItemSelected]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}>
              <AppText
                variant="label"
                style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {tab}
              </AppText>
              {isSelected ? <View style={styles.tabIndicator} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* ================= PARTY / LOADS TAB ================= */}
        {activeTab === 'Loads' ? (
          <LoadsPane
            loads={displayLoads}
            currentTripId={displayTrip.id}
            expandedId={expandedLoadId}
            onToggle={setExpandedLoadId}
            onNextStatus={handleNextStatus}
            isUpdatingStatus={isUpdatingStatus}
            onAddAdvance={load => {
              setTargetTrip(load);
              setAdvanceSheetVisible(true);
            }}
            onAddCharge={load => {
              setTargetTrip(load);
              setChargeSheetVisible(true);
            }}
            onAddPayment={load => {
              setTargetTrip(load);
              setPaymentSheetVisible(true);
            }}
            onNavigateProgress={id =>
              navigation.navigate(routes.tripProgress, {tripId: id})
            }
            onNavigateAddTrip={() =>
              navigation.navigate(routes.addTrip, {
                truckId: displayTrip.truckId,
                truckNumber: displayTrip.truckNumber,
                driverId: displayTrip.driverId,
                driverName: displayTrip.driverName,
                originId: displayTrip.destinationId,
                originName: displayTrip.destination,
                referenceNo: displayTrip.referenceNo || null,
                parentTripNo: displayTrip.tripno || displayTrip.id,
              })
            }
          />
        ) : activeTab === 'Party' && (
          <View style={styles.tabPane}>
            
            {/* Customer & Route Card */}
            <View style={styles.card}>
              {/* Customer Header */}
              <View style={styles.customerRow}>
                <View style={styles.customerNameBlock}>
                  <Icon name="account-circle" size={22} color={colors.primary} />
                  <AppText variant="body" style={styles.customerName}>
                    {displayTrip.partyName}
                  </AppText>
                </View>
                <View style={styles.amountPill}>
                  <AppText variant="label" style={styles.amountPillText}>
                    ₹{displayTrip.freightAmount.toLocaleString('en-IN')}
                  </AppText>
                </View>
              </View>

              {/* Route Display */}
              <View style={styles.routeSection}>
                <View style={styles.routeCitiesRow}>
                  <View style={styles.cityBlock}>
                    <AppText variant="body" style={styles.cityName}>
                      {displayTrip.origin}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {displayTrip.tripDate}
                    </AppText>
                  </View>

                  <View style={styles.centerArrowBlock}>
                    <View style={styles.arrowLine} />
                    <View style={styles.arrowCircle}>
                      <Icon name="arrow-right" size={16} color={colors.text} />
                    </View>
                    <View style={styles.arrowLine} />
                  </View>

                  <View style={[styles.cityBlock, styles.cityBlockRight]}>
                    <AppText variant="body" style={styles.cityName}>
                      {displayTrip.destination}
                    </AppText>
                    {displayTrip.lrNumber ? (
                      <AppText variant="caption" color="textMuted">
                        #{displayTrip.lrNumber}
                      </AppText>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Status Stepper */}
              <TripStatusStepper
                currentStatus={displayTrip.status}
                timeline={displayTrip.statusTimeline}
                onPress={() => navigation.navigate(routes.tripProgress, {tripId: displayTrip.id})}
              />

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.completeTripBtn}
                  onPress={handleNextStatus}
                  disabled={isUpdatingStatus}
                  activeOpacity={0.7}>
                  <AppText variant="label" style={styles.completeTripText}>
                    {isUpdatingStatus
                      ? 'Updating...'
                      : displayTrip.status === 'Started'
                      ? 'Complete Trip'
                      : displayTrip.status === 'Completed'
                      ? 'POD Received'
                      : displayTrip.status === 'POD Received'
                      ? 'Submit POD'
                      : displayTrip.status === 'POD Submitted'
                      ? 'Settle Party'
                      : 'Trip Settled'}
                  </AppText>
                </TouchableOpacity>

                {canViewBill ? (
                  <TouchableOpacity
                    style={styles.viewBillBtn}
                    onPress={() =>
                      Alert.alert(
                        'Trip Bill Summary',
                        `Freight: ₹${displayTrip.freightAmount}\nPending: ₹${displayTrip.pendingBalance}\nStatus: ${displayTrip.status}`,
                      )
                    }
                    activeOpacity={0.7}>
                    <AppText variant="label" style={styles.viewBillText}>
                      View Bill
                    </AppText>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

            {/* Financial Details Card */}
            <View style={styles.card}>
              <View style={styles.financialRow}>
                <AppText variant="body" style={styles.financialLabel}>
                  Freight Amount
                </AppText>
                <View style={styles.freightEditRow}>
                  <AppText variant="body" style={styles.financialValue}>
                    ₹{displayTrip.freightAmount.toLocaleString('en-IN')}
                  </AppText>
                  <Icon name="pencil" size={16} color={colors.primary} />
                </View>
              </View>

              {/* (-) Advance */}
              <View style={styles.financialSection}>
                <View style={styles.financialRow}>
                  <AppText variant="body" color="textMuted">
                    (-) Advance
                  </AppText>
                  <AppText variant="body" style={styles.financialValue}>
                    ₹{(displayTrip.advanceAmount || 0).toLocaleString('en-IN')}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => setAdvanceSheetVisible(true)}
                  style={styles.actionLinkBtn}>
                  <AppText variant="label" style={styles.actionLinkText}>
                    Add Advance
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* (+) Charges */}
              <View style={styles.financialSection}>
                <View style={styles.financialRow}>
                  <AppText variant="body" color="textMuted">
                    (+) Charges
                  </AppText>
                  <AppText variant="body" style={styles.financialValue}>
                    ₹{(displayTrip.chargesAmount || 0).toLocaleString('en-IN')}
                  </AppText>
                </View>

                {billLineItems.length > 0 ? (
                  <View style={styles.chargeItemsList}>
                    {billLineItems.map(item => (
                      <View key={item.id} style={styles.chargeItemRow}>
                        <AppText variant="caption" color="textMuted" style={styles.chargeItemLabel}>
                          {item.date} · {item.label}
                        </AppText>
                        <AppText variant="caption" style={styles.chargeItemAmount}>
                          {item.reduce ? '−' : ''}₹{item.amount.toLocaleString('en-IN')}
                        </AppText>
                      </View>
                    ))}
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => setChargeSheetVisible(true)}
                  style={styles.actionLinkBtn}>
                  <AppText variant="label" style={styles.actionLinkText}>
                    Add Charges
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* (-) Payments */}
              <View style={styles.financialSection}>
                <View style={styles.financialRow}>
                  <AppText variant="body" color="textMuted">
                    (-) Payments
                  </AppText>
                  <AppText variant="body" style={styles.financialValue}>
                    ₹{(displayTrip.paymentsAmount || 0).toLocaleString('en-IN')}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => setPaymentSheetVisible(true)}
                  style={styles.actionLinkBtn}>
                  <AppText variant="label" style={styles.actionLinkText}>
                    Add Payment
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Dashed Separator */}
              <View style={styles.dashedDivider} />

              {/* Pending Balance */}
              <View style={styles.financialRow}>
                <AppText variant="heading" style={styles.pendingBalanceLabel}>
                  Pending Balance
                </AppText>
                <AppText variant="heading" style={styles.pendingBalanceValue}>
                  ₹{(displayTrip.pendingBalance || 0).toLocaleString('en-IN')}
                </AppText>
              </View>

              {/* Note & Request Money Action Row */}
              <View style={styles.bottomFinancialActions}>
                <TouchableOpacity
                  style={styles.noteBtn}
                  onPress={() => Alert.alert('Trip Notes', displayTrip.notes || 'No note added.')}>
                  <Icon name="plus" size={16} color={colors.primary} />
                  <AppText variant="label" style={styles.noteBtnText}>
                    Note
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.requestMoneyBtn}
                  onPress={() =>
                    Alert.alert(
                      'Request Money',
                      `Payment reminder of ₹${displayTrip.pendingBalance} sent to ${displayTrip.partyName}.`,
                    )
                  }>
                  <AppText variant="label" style={styles.requestMoneyText}>
                    Request Money
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Add Load to this Trip Card — opens the shared Add Trip form prefilled
            from this trip: same truck + driver, origin = this trip's
            destination, and the same referenceno so both group as loads. */}
            <TouchableOpacity
              style={styles.addLoadCard}
              onPress={() =>
                navigation.navigate(routes.addTrip, {
                  truckId: displayTrip.truckId,
                  truckNumber: displayTrip.truckNumber,
                  driverId: displayTrip.driverId,
                  driverName: displayTrip.driverName,
                  originId: displayTrip.destinationId,
                  originName: displayTrip.destination,
                  referenceNo: displayTrip.referenceNo || null,
                  parentTripNo: displayTrip.tripno || displayTrip.id,
                })
              }
              activeOpacity={0.7}>
              <AppText variant="label" style={styles.addLoadText}>
                Add load to this Trip
              </AppText>
              <Icon name="chevron-right" size={20} color={colors.primary} />
            </TouchableOpacity>

          </View>
        )}

        {/* ================= PROFIT TAB ================= */}
        {activeTab === 'Profit' && (
          <View style={styles.tabPane}>
            {/* Revenue Card */}
            <View style={styles.card}>
              <View style={styles.profitSectionHeader}>
                <AppText variant="heading" style={styles.revenueTitle}>
                  (+) Revenue
                </AppText>
              </View>

              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  Customer: {displayTrip.partyName}
                </AppText>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{displayTrip.freightAmount.toLocaleString('en-IN')}
                </AppText>
              </View>

              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  Extra Charges
                </AppText>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{(displayTrip.chargesAmount || 0).toLocaleString('en-IN')}
                </AppText>
              </View>

              <View style={styles.dashedDivider} />

              <View style={styles.financialRow}>
                <AppText variant="label" style={styles.boldText}>
                  Total Revenue
                </AppText>
                <AppText variant="label" style={[styles.boldText, {color: colors.success}]}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </AppText>
              </View>
            </View>

            {/* Expenses Card */}
            <View style={styles.card}>
              <View style={styles.expenseHeaderRow}>
                <AppText variant="heading" style={styles.expenseTitle}>
                  (-) Expenses
                </AppText>
                <TouchableOpacity
                  onPress={() => setExpenseSheetVisible(true)}
                  style={styles.actionLinkBtn}>
                  <AppText variant="label" style={styles.actionLinkText}>
                    Add Expense
                  </AppText>
                </TouchableOpacity>
              </View>

              {displayTrip.expenses && displayTrip.expenses.length > 0 ? (
                displayTrip.expenses.map((exp, idx) => (
                  <View key={exp.id || idx} style={styles.financialRow}>
                    <AppText variant="body" color="textMuted">
                      {exp.type} ({exp.date})
                    </AppText>
                    <AppText variant="body" style={styles.financialValue}>
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText variant="caption" color="textMuted" style={styles.noDataText}>
                  No trip expenses recorded yet.
                </AppText>
              )}

              <View style={styles.dashedDivider} />

              <View style={styles.financialRow}>
                <AppText variant="label" style={styles.boldText}>
                  Total Expenses
                </AppText>
                <AppText variant="label" style={[styles.boldText, {color: colors.danger}]}>
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </AppText>
              </View>
            </View>

            {/* Net Profit Summary Card */}
            <View style={[styles.card, styles.profitSummaryCard]}>
              <View style={styles.profitBanner}>
                <View>
                  <AppText variant="caption" color="textMuted">
                    ESTIMATED NET PROFIT
                  </AppText>
                  <AppText variant="title" style={[styles.profitAmount, {color: netProfit >= 0 ? colors.success : colors.danger}]}>
                    ₹{netProfit.toLocaleString('en-IN')}
                  </AppText>
                </View>
                <View style={[styles.profitIconCircle, {backgroundColor: netProfit >= 0 ? colors.successSoft : colors.dangerSoft}]}>
                  <Icon
                    name={netProfit >= 0 ? 'trending-up' : 'trending-down'}
                    size={28}
                    color={netProfit >= 0 ? colors.success : colors.danger}
                  />
                </View>
              </View>
              <AppText variant="caption" color="textMuted" style={styles.profitFormula}>
                Profit = Revenue (₹{totalRevenue.toLocaleString('en-IN')}) - Expenses (₹{totalExpenses.toLocaleString('en-IN')})
              </AppText>
            </View>
          </View>
        )}

        {/* ================= DRIVER TAB ================= */}
        {activeTab === 'Driver' && (
          <View style={styles.tabPane}>
            {/* Driver Profile Card */}
            <View style={styles.card}>
              <View style={styles.driverHeaderRow}>
                <View style={styles.driverAvatar}>
                  <Icon name="account-tie" size={28} color={colors.surface} />
                </View>
                <View style={styles.driverMeta}>
                  <AppText variant="heading" style={styles.driverName}>
                    {displayTrip.driverName || 'Unassigned Driver'}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {displayTrip.driverPhone ? `+91 ${displayTrip.driverPhone}` : 'No phone linked'}
                  </AppText>
                </View>
                <View style={styles.onTripBadge}>
                  <AppText variant="caption" style={styles.onTripText}>
                    On Trip
                  </AppText>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  Current Driver Balance
                </AppText>
                <AppText variant="heading" style={styles.driverBalanceAmt}>
                  ₹{(displayTrip.driverBalance || 0).toLocaleString('en-IN')}
                </AppText>
              </View>

              <TouchableOpacity
                style={styles.addDriverBalanceBtn}
                onPress={() => setDriverBalanceVisible(true)}
                activeOpacity={0.7}>
                <Icon name="plus" size={18} color={colors.surface} />
                <AppText variant="label" style={styles.addDriverBalanceText}>
                  Add Driver Balance
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Advances / Transactions History */}
            <View style={styles.card}>
              <AppText variant="heading" style={styles.cardSubtitle}>
                Driver Advances & Settlements
              </AppText>

              {displayTrip.advances && displayTrip.advances.length > 0 ? (
                displayTrip.advances.map(adv => (
                  <View key={adv.id} style={styles.driverTxRow}>
                    <View>
                      <AppText variant="body" style={styles.boldText}>
                        Advance ({adv.paymentMode})
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        {adv.date} • {adv.receivedByDriver ? 'Received by Driver' : 'Direct Payment'}
                      </AppText>
                    </View>
                    <AppText variant="body" style={styles.financialValue}>
                      ₹{adv.amount.toLocaleString('en-IN')}
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText variant="caption" color="textMuted" style={styles.noDataText}>
                  No advances recorded for this displayTrip.
                </AppText>
              )}
            </View>
          </View>
        )}

        {/* ================= MORE TAB ================= */}
        {activeTab === 'More' && (
          <View style={styles.tabPane}>
            <View style={styles.card}>
              <AppText variant="heading" style={styles.cardSubtitle}>
                Additional Trip Information
              </AppText>

              <View style={styles.metaRow}>
                <AppText variant="caption" color="textMuted">
                  Trip ID
                </AppText>
                <AppText variant="body" style={styles.boldText}>
                  {displayTrip.id}
                </AppText>
              </View>

              <View style={styles.metaRow}>
                <AppText variant="caption" color="textMuted">
                  LR Number
                </AppText>
                <AppText variant="body" style={styles.boldText}>
                  {displayTrip.lrNumber || 'Not provided'}
                </AppText>
              </View>

              <View style={styles.metaRow}>
                <AppText variant="caption" color="textMuted">
                  Material
                </AppText>
                <AppText variant="body" style={styles.boldText}>
                  {displayTrip.material || 'General Freight'}
                </AppText>
              </View>

              <View style={styles.metaRow}>
                <AppText variant="caption" color="textMuted">
                  Start KM
                </AppText>
                <AppText variant="body" style={styles.boldText}>
                  {displayTrip.startKm ? `${displayTrip.startKm} KM` : 'Not recorded'}
                </AppText>
              </View>

              <View style={styles.metaRow}>
                <AppText variant="caption" color="textMuted">
                  Billing Type
                </AppText>
                <AppText variant="body" style={styles.boldText}>
                  {displayTrip.billingType}
                </AppText>
              </View>

              {displayTrip.notes ? (
                <View style={styles.notesBlock}>
                  <AppText variant="caption" color="textMuted">
                    Notes
                  </AppText>
                  <AppText variant="body" style={styles.notesText}>
                    {displayTrip.notes}
                  </AppText>
                </View>
              ) : null}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Add Advance Modal */}
      <AddAdvanceSheet
        visible={advanceSheetVisible}
        onSave={handleSaveAdvance}
        onClose={() => setAdvanceSheetVisible(false)}
        isPending={isAddingAdvance}
        isMarketTruck={Boolean(displayTrip.supplierId)}
        partyName={displayTrip.partyName}
        supplierName={displayTrip.supplierName}
      />

      {/* Add Charge Modal */}
      <AddChargeSheet
        visible={chargeSheetVisible}
        onSave={handleSaveCharge}
        onClose={() => setChargeSheetVisible(false)}
        isPending={isAddingCharge}
        isMarketTruck={Boolean(displayTrip.supplierId)}
        partyName={displayTrip.partyName}
        supplierName={displayTrip.supplierName}
        partyId={displayTrip.partyId}
        supplierId={displayTrip.supplierId}
      />

      {/* Add Driver Balance Modal */}
      <AddDriverBalanceSheet
        visible={driverBalanceVisible}
        driverName={displayTrip.driverName}
        onConfirm={handleSaveDriverBalance}
        onClose={() => setDriverBalanceVisible(false)}
        isPending={isAddingDriverBalance}
      />
      <AddPaymentSheet
        visible={paymentSheetVisible}
        onSave={handleSavePayment}
        onClose={() => setPaymentSheetVisible(false)}
        isPending={isAddingPayment}
        partyName={displayTrip.partyName}
        partyId={displayTrip.partyId}
      />

      {/* Add Expense Modal */}
      <AddExpenseSheet
        visible={expenseSheetVisible}
        onSave={handleSaveExpense}
        onClose={() => setExpenseSheetVisible(false)}
        isPending={isAddingExpense}
      />

      {/* Trip Status Advance Modal */}
      <TripStatusSheet
        visible={statusSheet.visible}
        status={statusSheet.nextStatus}
        onConfirm={handleStatusConfirm}
        onClose={() => setStatusSheet(prev => ({...prev, visible: false}))}
        isPending={isUpdatingStatus}
      />
    </AppScreen>
  );
}

/**
 * Loads tab — lists every trip sharing the same reference number as the
 * current trip. Each load uses the Party tab style UI (collapsible/expandable)
 * matching the user design specs.
 */
function LoadsPane({
  loads,
  currentTripId,
  expandedId,
  onToggle,
  onNextStatus,
  isUpdatingStatus,
  onAddAdvance,
  onAddCharge,
  onAddPayment,
  onNavigateProgress,
  onNavigateAddTrip,
}) {
  return (
    <View style={styles.tabPane}>
      {loads.map(load => (
        <LoadCard
          key={load.id}
          load={load}
          isCurrent={load.id === currentTripId}
          isExpanded={expandedId === load.id}
          onToggle={onToggle}
          onNextStatus={onNextStatus}
          isUpdatingStatus={isUpdatingStatus}
          onAddAdvance={onAddAdvance}
          onAddCharge={onAddCharge}
          onAddPayment={onAddPayment}
          onNavigateProgress={onNavigateProgress}
        />
      ))}

      {/* Add Load to this Trip Card */}
      <TouchableOpacity
        style={styles.addLoadCard}
        onPress={onNavigateAddTrip}
        activeOpacity={0.7}>
        <AppText variant="label" style={styles.addLoadText}>
          Add load to this Trip
        </AppText>
        <Icon name="chevron-right" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

function LoadCard({
  load,
  isCurrent,
  isExpanded,
  onToggle,
  onNextStatus,
  isUpdatingStatus,
  onAddAdvance,
  onAddCharge,
  onAddPayment,
  onNavigateProgress,
}) {
  const canViewBill = ['Completed', 'POD Received', 'POD Submitted', 'Settled'].includes(load.status);

  const billLineItems = useMemo(() => {
    const chargeItems = (load.charges || []).map(c => ({
      id: `charge-${c.id || Date.now()}`,
      date: c.date || '',
      label: c.chargeType || c.type || 'Charge',
      amount: Number(c.amount) || 0,
      reduce: (c.billAdjustment || 'add') === 'reduce',
    }));
    const expenseItems = (load.expenses || [])
      .filter(e => e.addToBill)
      .map(e => ({
        id: `expense-${e.id || Date.now()}`,
        date: e.date || '',
        label: e.type || 'Expense',
        amount: Number(e.amount) || 0,
        reduce: false,
      }));
    return [...chargeItems, ...expenseItems];
  }, [load]);

  return (
    <View style={styles.card}>
      {/* Customer Header */}
      <View style={styles.customerRow}>
        <View style={styles.customerNameBlock}>
          <Icon name="account-circle" size={22} color={colors.primary} />
          <AppText variant="body" style={styles.customerName}>
            {load.partyName}
          </AppText>
          {isCurrent ? (
            <AppText variant="caption" style={styles.currentBadge}>
              · Current
            </AppText>
          ) : null}
        </View>
        <View style={styles.amountPill}>
          <AppText variant="label" style={styles.amountPillText}>
            ₹{load.freightAmount.toLocaleString('en-IN')}
          </AppText>
        </View>
      </View>

      {/* Route Display */}
      <View style={styles.routeSection}>
        <View style={styles.routeCitiesRow}>
          <View style={styles.cityBlock}>
            <AppText variant="body" style={styles.cityName}>
              {load.origin}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {load.tripDate}
            </AppText>
          </View>

          <View style={styles.centerArrowBlock}>
            <View style={styles.arrowLine} />
            <View style={styles.arrowCircle}>
              <Icon name="arrow-right" size={16} color={colors.text} />
            </View>
            <View style={styles.arrowLine} />
          </View>

          <View style={[styles.cityBlock, styles.cityBlockRight]}>
            <AppText variant="body" style={styles.cityName}>
              {load.destination}
            </AppText>
          </View>
        </View>
      </View>

      {/* Expanded Sections */}
      {isExpanded ? (
        <>
          {load.lrNumber ? (
            <View style={styles.lrNumberCenter}>
              <AppText variant="body" style={styles.lrNumberCenterText}>
                #{load.lrNumber}
              </AppText>
            </View>
          ) : null}

          {/* Status Stepper */}
          <TripStatusStepper
            currentStatus={load.status}
            timeline={load.statusTimeline}
            onPress={() => onNavigateProgress(load.id)}
          />

          {/* Action Buttons */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.completeTripBtn}
              onPress={() => onNextStatus(load)}
              disabled={isUpdatingStatus}
              activeOpacity={0.7}>
              <AppText variant="label" style={styles.completeTripText}>
                {isUpdatingStatus
                  ? 'Updating...'
                  : load.status === 'Started'
                  ? 'Complete Trip'
                  : load.status === 'Completed'
                  ? 'POD Received'
                  : load.status === 'POD Received'
                  ? 'Submit POD'
                  : load.status === 'POD Submitted'
                  ? 'Settle Party'
                  : 'Trip Settled'}
              </AppText>
            </TouchableOpacity>

            {canViewBill ? (
              <TouchableOpacity
                style={styles.viewBillBtn}
                onPress={() =>
                  Alert.alert(
                    'Trip Bill Summary',
                    `Freight: ₹${load.freightAmount}\nPending: ₹${load.pendingBalance}\nStatus: ${load.status}`,
                  )
                }
                activeOpacity={0.7}>
                <AppText variant="label" style={styles.viewBillText}>
                  View Bill
                </AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Financial Breakdown Section */}
          <View style={styles.financialSectionBlock}>
            <View style={styles.financialRow}>
              <AppText variant="body" style={styles.financialLabel}>
                Freight Amount
              </AppText>
              <View style={styles.freightEditRow}>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{(load.freightAmount || 0).toLocaleString('en-IN')}
                </AppText>
                <Icon name="pencil" size={16} color={colors.primary} />
              </View>
            </View>

            {/* (-) Advance */}
            <View style={styles.financialSection}>
              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  (-) Advance
                </AppText>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{(load.advanceAmount || 0).toLocaleString('en-IN')}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => onAddAdvance(load)}
                style={styles.actionLinkBtn}>
                <AppText variant="label" style={styles.actionLinkText}>
                  Add Advance
                </AppText>
              </TouchableOpacity>
            </View>

            {/* (+) Charges */}
            <View style={styles.financialSection}>
              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  (+) Charges
                </AppText>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{(load.chargesAmount || 0).toLocaleString('en-IN')}
                </AppText>
              </View>

              {billLineItems.length > 0 ? (
                <View style={styles.chargeItemsList}>
                  {billLineItems.map(item => (
                    <View key={item.id} style={styles.chargeItemRow}>
                      <AppText variant="caption" color="textMuted" style={styles.chargeItemLabel}>
                        {item.date} · {item.label}
                      </AppText>
                      <AppText variant="caption" style={styles.chargeItemAmount}>
                        {item.reduce ? '−' : ''}₹{item.amount.toLocaleString('en-IN')}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity
                onPress={() => onAddCharge(load)}
                style={styles.actionLinkBtn}>
                <AppText variant="label" style={styles.actionLinkText}>
                  Add Charges
                </AppText>
              </TouchableOpacity>
            </View>

            {/* (-) Payments */}
            <View style={styles.financialSection}>
              <View style={styles.financialRow}>
                <AppText variant="body" color="textMuted">
                  (-) Payments
                </AppText>
                <AppText variant="body" style={styles.financialValue}>
                  ₹{(load.paymentsAmount || 0).toLocaleString('en-IN')}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => onAddPayment(load)}
                style={styles.actionLinkBtn}>
                <AppText variant="label" style={styles.actionLinkText}>
                  Add Payment
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Dashed Separator */}
            <View style={styles.dashedDivider} />

            {/* Pending Balance */}
            <View style={styles.financialRow}>
              <AppText variant="heading" style={styles.pendingBalanceLabel}>
                Pending Balance
              </AppText>
              <AppText variant="heading" style={styles.pendingBalanceValue}>
                ₹{(load.pendingBalance || 0).toLocaleString('en-IN')}
              </AppText>
            </View>

            {/* Note & Request Money Action Row */}
            <View style={styles.bottomFinancialActions}>
              <TouchableOpacity
                style={styles.noteBtn}
                onPress={() => Alert.alert('Trip Notes', load.notes || 'No note added.')}>
                <Icon name="plus" size={16} color={colors.primary} />
                <AppText variant="label" style={styles.noteBtnText}>
                  Note
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.requestMoneyBtn}
                onPress={() =>
                  Alert.alert(
                    'Request Money',
                    `Payment reminder of ₹${load.pendingBalance} sent to ${load.partyName}.`,
                  )
                }>
                <AppText variant="label" style={styles.requestMoneyText}>
                  Request Money
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : null}

      {/* Center Bottom Toggle Button */}
      <TouchableOpacity
        style={styles.toggleDetailsBtn}
        onPress={() => onToggle(isExpanded ? null : load.id)}
        activeOpacity={0.7}>
        <AppText variant="label" style={styles.toggleDetailsText}>
          {isExpanded ? 'View less' : 'View full details'}
        </AppText>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-right'}
          size={18}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: 4,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  editText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  vehicleBanner: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  truckNumber: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
    letterSpacing: 0.5,
  },
  driverSubText: {
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  tabItemSelected: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  tabPane: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerNameBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  customerName: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.primary,
  },
  amountPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.round,
  },
  amountPillText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
  },
  routeSection: {
    paddingVertical: spacing.xs,
  },
  routeCitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityBlock: {
    flex: 1,
  },
  cityBlockRight: {
    alignItems: 'flex-end',
  },
  cityName: {
    fontWeight: '700',
    fontSize: 15,
    color: colors.text,
  },
  centerArrowBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
  arrowLine: {
    width: 28,
    height: 1,
    backgroundColor: colors.border1,
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  completeTripBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: radius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTripText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 13,
  },
  viewBillBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBillText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financialLabel: {
    fontWeight: '600',
    color: colors.text,
  },
  financialValue: {
    fontWeight: '700',
    color: colors.text,
  },
  freightEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  financialSection: {
    gap: 2,
  },
  chargeItemsList: {
    gap: 4,
    paddingVertical: 2,
  },
  chargeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
  },
  chargeItemLabel: {
    flex: 1,
    fontSize: 12,
  },
  chargeItemAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  actionLinkBtn: {
    alignSelf: 'flex-start',
  },
  actionLinkText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  pendingBalanceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  pendingBalanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomFinancialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  noteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteBtnText: {
    color: colors.text,
    fontWeight: '600',
  },
  requestMoneyBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  requestMoneyText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  addLoadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addLoadText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  profitSectionHeader: {
    marginBottom: spacing.xs,
  },
  expenseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  revenueTitle: {
    fontSize: 16,
    color: colors.success,
  },
  expenseTitle: {
    fontSize: 16,
    color: colors.danger,
  },
  boldText: {
    fontWeight: '700',
  },
  noDataText: {
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  profitSummaryCard: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  profitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  profitIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profitFormula: {
    marginTop: spacing.xs,
    fontSize: 11,
  },
  driverHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMeta: {
    flex: 1,
    gap: 2,
  },
  driverName: {
    fontSize: 16,
  },
  onTripBadge: {
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  onTripText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 11,
  },
  driverBalanceAmt: {
    fontSize: 18,
    color: colors.primary,
  },
  addDriverBalanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 44,
  },
  addDriverBalanceText: {
    color: colors.surface,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  driverTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  notesBlock: {
    marginTop: spacing.xs,
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  notesText: {
    fontSize: 13,
  },
  loadsIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  loadsIntroText: {
    fontSize: 14,
  },
  loadCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  loadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  loadHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  loadTruckNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  currentBadge: {
    color: colors.primary,
    fontWeight: '600',
  },
  loadStatusPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  loadStatusText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loadRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  loadRouteText: {
    flex: 1,
    fontSize: 14,
  },
  loadAmount: {
    color: colors.text,
    fontWeight: '600',
  },
  loadToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  loadToggleText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loadDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
    fontSize: 13,
  },
  detailValueStrong: {
    fontWeight: '700',
  },
  loadNotes: {
    marginTop: spacing.xs,
    gap: 4,
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  lrNumberCenter: {
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  lrNumberCenterText: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.text,
  },
  financialSectionBlock: {
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  toggleDetailsText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
