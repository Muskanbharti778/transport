import React, {useState} from 'react';
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
import {DatePickerModal} from '../components/DatePickerModal';
import {colors, radius, spacing} from '../../../theme';

function getFormattedToday() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

const PAYMENT_MODES = [
  {value: 'cash', label: 'Cash'},
  {value: 'upi', label: 'UPI'},
  {value: 'bank_transfer', label: 'Bank Transfer'},
  {value: 'cheque', label: 'Cheque'},
];

export function AddPaymentSheet({
  visible,
  onSave,
  onClose,
  isPending,
  partyName = '',
  partyId = null,
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getFormattedToday());
  const [paymentMode, setPaymentMode] = useState('cash');
  const [note, setNote] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [modePickerVisible, setModePickerVisible] = useState(false);

  const handleSave = () => {
    if (!amount.trim()) return;
    onSave({
      cid: partyId ? Number(partyId) : null,
      amount: Number(amount),
      date,
      paymentMode,
      note: note.trim(),
    });
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
                  <AppText variant="heading" style={styles.title}>
                    Add Payment
                  </AppText>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeBtn}
                    accessibilityLabel="Close">
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {partyName ? (
                  <AppText variant="caption" color="textMuted" style={styles.partyLabel}>
                    Payment from {partyName}
                  </AppText>
                ) : null}

                <View style={styles.form}>
                  {/* Payment Amount */}
                  <View style={styles.fieldWrapper}>
                    <View style={styles.inputWithPrefix}>
                      <AppText variant="body" style={styles.currencyPrefix}>
                        ₹
                      </AppText>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Payment Amount"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                        style={styles.flexInput}
                      />
                    </View>
                  </View>

                  {/* Payment Date */}
                  <TouchableOpacity
                    style={styles.fieldWrapper}
                    onPress={() => setDatePickerVisible(true)}
                    activeOpacity={0.7}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        Payment Date
                      </AppText>
                    </View>
                    <View style={styles.inputWithSuffix}>
                      <AppText
                        variant="body"
                        style={[styles.flexInputText, !date && styles.placeholderText]}>
                        {date || 'Select payment date'}
                      </AppText>
                      <Icon name="calendar-month-outline" size={20} color={colors.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* Payment Mode */}
                  <TouchableOpacity
                    style={styles.fieldWrapper}
                    onPress={() => setModePickerVisible(true)}
                    activeOpacity={0.7}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        Payment Mode
                      </AppText>
                    </View>
                    <View style={styles.inputWithSuffix}>
                      <AppText variant="body" style={styles.flexInputText}>
                        {PAYMENT_MODES.find(m => m.value === paymentMode)?.label || 'Cash'}
                      </AppText>
                      <Icon name="chevron-down" size={22} color={colors.textMuted} />
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
                    title={isPending ? 'Saving...' : 'Save Payment'}
                    onPress={handleSave}
                    disabled={!amount.trim() || isPending}
                    style={styles.saveBtn}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Date Picker */}
      <DatePickerModal
        visible={datePickerVisible}
        initialDate={date}
        onSelectDate={setDate}
        onClose={() => setDatePickerVisible(false)}
        title="Select Payment Date"
      />

      {/* Payment Mode Picker (simple inline modal) */}
      <Modal
        visible={modePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModePickerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModePickerVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View style={styles.modeSheet}>
                <AppText variant="heading" style={styles.modeTitle}>
                  Payment Mode
                </AppText>
                {PAYMENT_MODES.map(mode => (
                  <TouchableOpacity
                    key={mode.value}
                    style={[
                      styles.modeOption,
                      paymentMode === mode.value && styles.modeOptionSelected,
                    ]}
                    onPress={() => {
                      setPaymentMode(mode.value);
                      setModePickerVisible(false);
                    }}
                    activeOpacity={0.7}>
                    <AppText
                      variant="body"
                      style={[
                        styles.modeOptionText,
                        paymentMode === mode.value && styles.modeOptionTextSelected,
                      ]}>
                      {mode.label}
                    </AppText>
                    {paymentMode === mode.value ? (
                      <Icon name="check" size={20} color={colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  partyLabel: {
    marginBottom: spacing.md,
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
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
  },
  modeSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing.xl,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  modeOptionSelected: {
    backgroundColor: colors.primarySoft,
  },
  modeOptionText: {
    fontSize: 15,
    color: colors.text,
  },
  modeOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
