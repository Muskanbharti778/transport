import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {AppButton} from '../../../components/common/AppButton';
import {colors, radius, spacing} from '../../../theme';

/**
 * QuickAddModal props:
 * - visible: boolean
 * - type: 'party' | 'truck' | 'driver'
 * - onAdd: (addedData) => void
 * - onClose: () => void
 */
export function QuickAddModal({visible, type = 'party', onAdd, onClose}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [extra, setExtra] = useState(''); // e.g. Vehicle type or Party category

  const isTruck = type === 'truck';
  const isDriver = type === 'driver';
  const isParty = type === 'party';
  const isCharge = type === 'charge';
  const isExpense = type === 'expense';

  const modalTitle = isParty
    ? 'Add New Party / Customer'
    : isTruck
    ? 'Add New Truck Number'
    : isCharge
    ? 'Add New Charge Type'
    : isExpense
    ? 'Add New Expense Type'
    : 'Add New Driver';

  const namePlaceholder = isParty
    ? 'Party / Customer Name (e.g. ABC Logistics)'
    : isTruck
    ? 'Truck No. (e.g. KA 01 AB 1234)'
    : isCharge
    ? 'Charge Type Name (e.g. Demurrage)'
    : isExpense
    ? 'Expense Type Name (e.g. Unloading Charge)'
    : 'Driver Full Name (e.g. Rajesh Singh)';

  const isPhoneValid = phone.trim().length >= 10 && /^\d+$/.test(phone.trim());
  const canSave = name.trim() && (!isParty || isPhoneValid);

  const handleSave = () => {
    if (!canSave) return;

    if (isParty) {
      onAdd({
        name: name.trim(),
        phoneNumber: phone.trim(),
        category: extra.trim() || 'Transport Partner',
      });
    } else if (isTruck) {
      onAdd({vehicleNumber: name.trim().toUpperCase(), vehicleTypeName: extra.trim() || '10 Wheeler (24 Ton)'});
    } else if (isCharge) {
      onAdd({chargename: name.trim()});
    } else if (isExpense) {
      onAdd({expensename: name.trim()});
    } else if (isDriver) {
      onAdd({name: name.trim(), phone: phone.trim()});
    }

    resetAndClose();
  };

  const resetAndClose = () => {
    setName('');
    setPhone('');
    setExtra('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={resetAndClose}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={styles.backdrop}>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Icon
                name={isParty ? 'account-plus' : isTruck ? 'truck-plus' : isCharge ? 'cash-plus' : isExpense ? 'clipboard-text-plus' : 'account-cog'}
                size={24}
                color={colors.primary}
              />
              <AppText variant="heading" style={styles.cardTitle}>
                {modalTitle}
              </AppText>
              <TouchableOpacity onPress={resetAndClose} style={styles.closeBtn}>
                <Icon name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <View style={styles.formContent}>
              <View style={styles.inputContainer}>
                <AppText variant="caption" color="textMuted" style={styles.inputLabel}>
                  {isParty ? 'Party Name *' : isTruck ? 'Vehicle Number *' : isCharge ? 'Charge Type Name *' : isExpense ? 'Expense Type Name *' : 'Driver Name *'}
                </AppText>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={namePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  autoCapitalize={isTruck ? 'characters' : 'words'}
                  autoFocus
                />
              </View>

              {!isTruck && !isCharge && !isExpense ? (
                <View style={styles.inputContainer}>
                  <AppText variant="caption" color="textMuted" style={styles.inputLabel}>
                    Mobile Number {isParty || isDriver ? '*' : '(Optional)'}
                  </AppText>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={10}
                    style={styles.input}
                  />
                  {isParty && phone.trim() && !isPhoneValid ? (
                    <AppText variant="caption" color="danger">
                      Enter a valid 10-digit mobile number
                    </AppText>
                  ) : null}
                </View>
              ) : isTruck ? (
                <View style={styles.inputContainer}>
                  <AppText variant="caption" color="textMuted" style={styles.inputLabel}>
                    Truck Type / Capacity (Optional)
                  </AppText>
                  <TextInput
                    value={extra}
                    onChangeText={setExtra}
                    placeholder="e.g. 10 Wheeler / Container / Trailer"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>
              ) : null}
            </View>

            {/* Buttons */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={resetAndClose}>
                <AppText variant="label" color="textMuted">
                  Cancel
                </AppText>
              </TouchableOpacity>

              <AppButton
                title="Add & Select"
                onPress={handleSave}
                disabled={!canSave}
                style={styles.saveBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    width: '100%',
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  formContent: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  saveBtn: {
    minWidth: 120,
    height: 44,
  },
});
