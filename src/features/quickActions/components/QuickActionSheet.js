import React, {forwardRef, useImperativeHandle, useMemo, useRef} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';
import {quickActionSheetController} from '../quickActionSheetController';
import {routes} from '../../../navigation/routeNames';
import {navigate} from '../../../navigation/navigationRef';

const actions = [
  {key: 'trip', label: 'New Trip', icon: 'truck-fast-outline', route: routes.addTrip},
  {key: 'expense', label: 'Add Expense', icon: 'receipt-outline'},
  {key: 'payment', label: 'Add Payment', icon: 'cash-multiple'},
  {key: 'party', label: 'Add Party', icon: 'account-group-outline', route: routes.addParty},
  {key: 'truck', label: 'Add Truck', icon: 'truck-plus-outline', route: routes.addTruck},
  {key: 'driver', label: 'Add Driver', icon: 'account-plus-outline', route: routes.addDriver},
  {key: 'supplier', label: 'Add Supplier', icon: 'account-plus-outline', route: routes.addSupplier},
];

const QuickActionSheet = forwardRef(function QuickActionSheet(_, forwardedRef) {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['42%'], []);

  useImperativeHandle(forwardedRef, () => ({
    present: () => bottomSheetRef.current?.expand(),
    dismiss: () => bottomSheetRef.current?.close(),
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <AppText variant="heading">Quick Action</AppText>
          <TouchableOpacity
            onPress={() => quickActionSheetController.close()}
            accessibilityLabel="Close">
            <Icon name="close" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionTile}
              onPress={() => {
                quickActionSheetController.close();
                if (action.route) {
                  navigate(action.route);
                }
              }}>
              <View style={styles.iconCircle}>
                <Icon name={action.icon} size={24} color={colors.onInk} />
              </View>
              <AppText variant="caption" style={styles.actionLabel}>
                {action.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default QuickActionSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
  },
  handleIndicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionTile: {
    width: '30%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.md + 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    textAlign: 'center',
  },
});