import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

const REASONS = ['Driver Bhatta', 'Fuel / Diesel', 'Toll Expense', 'Vehicle Repair', 'Trip Advance', 'Other'];

function getFormattedToday() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function AddDriverBalanceSheet({
  visible,
  driverName,
  onConfirm,
  onClose,
  isPending,
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('Driver Bhatta');
  const [date, setDate] = useState(getFormattedToday());
  const [note, setNote] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleConfirm = () => {
    if (!amount.trim()) return;
    onConfirm({
      amount: Number(amount),
      reason,
      date,
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
              
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <AppText variant="heading" style={styles.title}>
                    Add Driver Balance
                  </AppText>
                  {driverName ? (
                    <AppText variant="caption" color="textMuted">
                      For {driverName}
                    </AppText>
                  ) : null}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityLabel="Close">
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Amount */}
                <View style={styles.fieldWrapper}>
                  <View style={styles.inputWithPrefix}>
                    <AppText variant="body" style={styles.currencyPrefix}>
                      ₹
                    </AppText>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Amount to Add"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      style={styles.flexInput}
                      autoFocus
                    />
                  </View>
                </View>

                {/* Reason */}
                <View style={styles.section}>
                  <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
                    Reason
                  </AppText>
                  <View style={styles.chipRow}>
                    {REASONS.map(r => {
                      const isSelected = reason === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.chip,
                            isSelected && styles.chipSelected,
                          ]}
                          onPress={() => setReason(r)}
                          activeOpacity={0.7}>
                          <AppText
                            variant="label"
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextSelected,
                            ]}>
                            {r}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Date */}
                <TouchableOpacity
                  style={styles.fieldWrapper}
                  onPress={() => setDatePickerVisible(true)}
                  activeOpacity={0.7}>
                  <View style={styles.floatingLabel}>
                    <AppText variant="caption" color="textMuted" style={styles.labelText}>
                      Date
                    </AppText>
                  </View>
                  <View style={styles.inputWithSuffix}>
                    <AppText
                      variant="body"
                      style={[styles.flexInputText, !date && styles.placeholderText]}>
                      {date || 'Select Date'}
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

                {/* Confirm Button */}
                <AppButton
                  title={isPending ? 'Confirming...' : 'Confirm'}
                  onPress={handleConfirm}
                  disabled={!amount.trim() || isPending}
                  style={styles.confirmBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Date Calendar Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        initialDate={date}
        onSelectDate={setDate}
        onClose={() => setDatePickerVisible(false)}
        title="Select Date"
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
  section: {
    gap: 4,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  confirmBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
  },
});
