import React, {useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppText} from '../../../components/common/AppText';
import {SelectOptionModal} from '../components/SelectOptionModal';
import {QuickAddModal} from '../components/QuickAddModal';
import {DatePickerModal} from '../components/DatePickerModal';
import {useChargesQuery} from '../hooks/useChargesQuery';
import {useCreateChargeMutation} from '../hooks/useCreateChargeMutation';
import {colors, radius, spacing} from '../../../theme';

function getFormattedToday() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function AddChargeSheet({
  visible,
  onSave,
  onClose,
  isPending,
  isMarketTruck = false,
  partyName = '',
  supplierName = '',
  partyId = null,
  supplierId = null,
}) {
  const [chargeFor, setChargeFor] = useState(isMarketTruck ? 'supplier' : 'party');
  const [billAdjustment, setBillAdjustment] = useState('add');
  const [chargeType, setChargeType] = useState(null); // {id, name}
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getFormattedToday());
  const [note, setNote] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Charge type picker state
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  const {data: apiCharges = []} = useChargesQuery();
  const {mutateAsync: createCharge} = useCreateChargeMutation();

  // Build the charge type options list for the SelectOptionModal.
  const chargeTypeOptions = useMemo(
    () =>
      apiCharges.map(c => ({
        name: c.chargename,
        label: c.chargename,
        value: c.id,
        id: c.id,
      })),
    [apiCharges],
  );

  // Top action: "+ Add Charge" opens the QuickAddModal.
  const chargeTopActions = useMemo(
    () => [
      {
        label: '+ Add Charge',
        icon: 'plus-circle',
        onPress: () => {
          setTypePickerVisible(false);
          setQuickAddVisible(true);
        },
      },
    ],
    [],
  );

  const handleSave = () => {
    if (!amount.trim() || !chargeType) return;
    onSave({
      chargeFor,
      cid: chargeType.id,
      amount: Number(amount),
      date,
      chargeType: chargeFor,
      billAdjustment,
      note: note.trim(),
    });
  };

  // Called when the user creates a custom charge via QuickAddModal.
  const handleQuickAddCharge = async ({chargename}) => {
    if (!chargename) return;
    try {
      const created = await createCharge(chargename);
      setChargeType({id: created.id, name: created.chargename || chargename});
    } catch (error) {
      // 409 = duplicate — find it in the existing list and select it.
      if (error?.response?.status === 409) {
        const existing = apiCharges.find(c => c.chargename === chargename);
        if (existing) {
          setChargeType({id: existing.id, name: existing.chargename});
        }
      }
    }
    setQuickAddVisible(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                  {isMarketTruck ? (
                    <View style={styles.chargeForRow}>
                      <TouchableOpacity
                        style={[
                          styles.chargeForBtn,
                          chargeFor === 'party' && styles.partyBtnSelected,
                        ]}
                        onPress={() => setChargeFor('party')}
                        activeOpacity={0.7}>
                        <AppText
                          variant="label"
                          style={[
                            styles.chargeForText,
                            chargeFor === 'party' && styles.partyTextSelected,
                          ]}>
                          Party Charge
                        </AppText>
                        <AppText
                          variant="caption"
                          numberOfLines={1}
                          style={[
                            styles.chargeForSub,
                            chargeFor === 'party' && styles.partySubSelected,
                          ]}>
                          {partyName || 'Party'}
                        </AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.chargeForBtn,
                          chargeFor === 'supplier' && styles.supplierBtnSelected,
                        ]}
                        onPress={() => setChargeFor('supplier')}
                        activeOpacity={0.7}>
                        <AppText
                          variant="label"
                          style={[
                            styles.chargeForText,
                            chargeFor === 'supplier' && styles.supplierTextSelected,
                          ]}>
                          Supplier Charge
                        </AppText>
                        <AppText
                          variant="caption"
                          numberOfLines={1}
                          style={[
                            styles.chargeForSub,
                            chargeFor === 'supplier' && styles.supplierSubSelected,
                          ]}>
                          {supplierName || 'Supplier'}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <AppText variant="heading" style={styles.title}>
                      Add Charge
                    </AppText>
                  )}
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeBtn}
                    accessibilityLabel="Close">
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  {/* Add to bill / Reduce from bill */}
                  <View style={styles.adjustSection}>
                    <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
                      Bill Adjustment
                    </AppText>
                    <View style={styles.adjustRow}>
                      <TouchableOpacity
                        style={styles.adjustOption}
                        onPress={() => setBillAdjustment('add')}
                        activeOpacity={0.7}>
                        <Icon
                          name={
                            billAdjustment === 'add'
                              ? 'radiobox-marked'
                              : 'radiobox-blank'
                          }
                          size={22}
                          color={billAdjustment === 'add' ? colors.primary : colors.textMuted}
                        />
                        <AppText
                          variant="body"
                          style={[
                            styles.adjustText,
                            billAdjustment === 'add' && styles.adjustTextSelected,
                          ]}>
                          Add to Bill
                        </AppText>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.adjustOption}
                        onPress={() => setBillAdjustment('reduce')}
                        activeOpacity={0.7}>
                        <Icon
                          name={
                            billAdjustment === 'reduce'
                              ? 'radiobox-marked'
                              : 'radiobox-blank'
                          }
                          size={22}
                          color={billAdjustment === 'reduce' ? '#C2410C' : colors.textMuted}
                        />
                        <AppText
                          variant="body"
                          style={[
                            styles.adjustText,
                            billAdjustment === 'reduce' && styles.reduceTextSelected,
                          ]}>
                          Reduce from Bill
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Charge Type — tappable field that opens a separate screen */}
                  <View style={styles.fieldWrapper}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        Charge Type
                      </AppText>
                    </View>
                    <TouchableOpacity
                      style={styles.inputWithSuffix}
                      onPress={() => setTypePickerVisible(true)}
                      activeOpacity={0.7}>
                      <AppText
                        variant="body"
                        style={[styles.flexInputText, !chargeType && styles.placeholderText]}>
                        {chargeType?.name || 'Select charge type'}
                      </AppText>
                      <Icon name="chevron-right" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Charge Amount */}
                  <View style={styles.fieldWrapper}>
                    <View style={styles.inputWithPrefix}>
                      <AppText variant="body" style={styles.currencyPrefix}>
                        ₹
                      </AppText>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Charge Amount"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                        style={styles.flexInput}
                      />
                    </View>
                  </View>

                  {/* Charge Date */}
                  <TouchableOpacity
                    style={styles.fieldWrapper}
                    onPress={() => setDatePickerVisible(true)}
                    activeOpacity={0.7}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        Charge Date
                      </AppText>
                    </View>
                    <View style={styles.inputWithSuffix}>
                      <AppText
                        variant="body"
                        style={[styles.flexInputText, !date && styles.placeholderText]}>
                        {date || 'Select charge date'}
                      </AppText>
                      <Icon name="calendar-month-outline" size={20} color={colors.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* Note */}
                  <View style={styles.fieldWrapper}>
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Note (Optional)"
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                  </View>

                  {/* Save Button */}
                  <AppButton
                    title={isPending ? 'Saving...' : 'Save'}
                    onPress={handleSave}
                    disabled={!amount.trim() || !chargeType || isPending}
                    style={styles.saveBtn}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Charge Date Calendar Picker */}
      <DatePickerModal
        visible={datePickerVisible}
        initialDate={date}
        onSelectDate={setDate}
        onClose={() => setDatePickerVisible(false)}
        title="Select Charge Date"
      />

      {/* Charge Type Picker — separate full-screen modal */}
      <SelectOptionModal
        visible={typePickerVisible}
        title="Select Charge Type"
        options={chargeTypeOptions}
        topActions={chargeTopActions}
        selectedValue={chargeType?.id}
        onSelect={item => {
          if (typeof item === 'string') {
            setChargeType({id: null, name: item});
          } else {
            setChargeType({id: item.id, name: item.name || item.label || item.value});
          }
        }}
        onClose={() => setTypePickerVisible(false)}
        allowCustom={false}
        placeholder="Search charge type..."
      />

      {/* Quick Add Custom Charge */}
      <QuickAddModal
        visible={quickAddVisible}
        type="charge"
        onAdd={handleQuickAddCharge}
        onClose={() => setQuickAddVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  form: {
    gap: spacing.md,
  },
  fieldWrapper: {
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    top: -9,
    left: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    zIndex: 2,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  flexInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  flexInputText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  chargeForRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  chargeForBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  partyBtnSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  supplierBtnSelected: {
    backgroundColor: '#FFEDD5',
    borderColor: '#EA580C',
  },
  chargeForText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  partyTextSelected: {
    color: colors.primary,
  },
  supplierTextSelected: {
    color: '#C2410C',
  },
  chargeForSub: {
    fontSize: 10,
    color: colors.textMuted,
    maxWidth: '100%',
  },
  partySubSelected: {
    color: colors.primary,
  },
  supplierSubSelected: {
    color: '#C2410C',
  },
  adjustSection: {
    gap: 4,
  },
  adjustRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  adjustOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  adjustText: {
    fontWeight: '500',
    color: colors.text,
  },
  adjustTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  reduceTextSelected: {
    color: '#C2410C',
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
  },
});
