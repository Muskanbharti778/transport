import React, {useMemo, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppText} from '../../../components/common/AppText';
import {SelectOptionModal} from '../components/SelectOptionModal';
import {QuickAddModal} from '../components/QuickAddModal';
import {DatePickerModal} from '../components/DatePickerModal';
import {useChargesQuery} from '../hooks/useChargesQuery';
import {useCreateChargeMutation} from '../hooks/useCreateChargeMutation';
import {colors, radius, spacing} from '../../../theme';

const PAYMENT_MODES = ['Cash', 'Cheque', 'UPI', 'Bank Transfer', 'Fuel', 'Others'];

function getFormattedToday() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function AddExpenseSheet({visible, onSave, onClose, isPending}) {
  const [expenseType, setExpenseType] = useState(null); // {id, name}
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getFormattedToday());
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [addToBill, setAddToBill] = useState(true);
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState(null);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  const {data: apiCharges = []} = useChargesQuery();
  const {mutateAsync: createCharge} = useCreateChargeMutation();

  // Expense type options sourced from the charge types endpoint so the
  // dropdown stays in sync with the backend master list.
  const expenseTypeOptions = useMemo(
    () =>
      apiCharges.map(c => ({
        name: c.chargename,
        label: c.chargename,
        value: c.id,
        id: c.id,
      })),
    [apiCharges],
  );

  // Top action: "+ Add Expense" opens the QuickAddModal.
  const expenseTopActions = useMemo(
    () => [
      {
        label: '+ Add Expense',
        icon: 'plus-circle',
        onPress: () => {
          setTypePickerVisible(false);
          setQuickAddVisible(true);
        },
      },
    ],
    [],
  );

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'TransportApp needs access to your camera to take an expense photo.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  };

  const takePhoto = async () => {
    setPhotoPickerVisible(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        saveToPhotos: false,
      });
      if (result.didCancel || result.errorCode) {
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setPhotoUri(asset.uri);
      }
    } catch {
      // Photo picker cancelled or error ignored
    }
  };

  const pickFromGallery = async () => {
    setPhotoPickerVisible(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
      });
      if (result.didCancel || result.errorCode) {
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setPhotoUri(asset.uri);
      }
    } catch {
      // Photo picker cancelled or error ignored
    }
  };

  const handleSave = () => {
    if (!amount.trim()) return;
    onSave({
      cid: expenseType?.id || null,
      type: expenseType?.name || 'Expense',
      amount: Number(amount),
      date,
      paymentMode,
      addToBill,
      note: note.trim(),
      photoUri,
    });
  };

  // Called when the user creates a custom expense type via QuickAddModal.
  // Persists it as a charge type so it remains available across sessions.
  const handleQuickAddExpense = async ({expensename}) => {
    if (!expensename) return;
    try {
      const created = await createCharge(expensename);
      setExpenseType({id: created.id, name: created.chargename || expensename});
    } catch (error) {
      // 409 = duplicate — find it in the existing list and select it.
      if (error?.response?.status === 409) {
        const existing = apiCharges.find(c => c.chargename === expensename);
        if (existing) {
          setExpenseType({id: existing.id, name: existing.chargename});
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
                  <AppText variant="heading" style={styles.title}>
                    Add Expense
                  </AppText>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeBtn}
                    accessibilityLabel="Close">
                    <Icon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.form}>
                  {/* Expense Type — tappable field that opens the picker */}
                  <View style={styles.fieldWrapper}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        Expense Type
                      </AppText>
                    </View>
                    <TouchableOpacity
                      style={styles.inputWithSuffix}
                      onPress={() => setTypePickerVisible(true)}
                      activeOpacity={0.7}>
                      <AppText
                        variant="body"
                        style={[styles.flexInputText, !expenseType && styles.placeholderText]}>
                        {expenseType?.name || 'Select expense type'}
                      </AppText>
                      <Icon name="chevron-right" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Expense Amount */}
                  <View style={styles.fieldWrapper}>
                    <View style={styles.inputWithPrefix}>
                      <AppText variant="body" style={styles.currencyPrefix}>
                        ₹
                      </AppText>
                      <TextInput
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="Expense Amount"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                        style={styles.flexInput}
                      />
                    </View>
                  </View>

                  {/* Expense Date */}
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

                  {/* Payment Mode Selector */}
                  <View style={styles.paymentSection}>
                    <AppText variant="caption" color="textMuted" style={styles.sectionLabel}>
                      Payment Mode
                    </AppText>
                    <View style={styles.chipRow}>
                      {PAYMENT_MODES.map(mode => {
                        const isSelected = paymentMode === mode;
                        return (
                          <TouchableOpacity
                            key={mode}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() => setPaymentMode(mode)}
                            activeOpacity={0.7}>
                            <AppText
                              variant="label"
                              style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                              {mode}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Add to Party Bill Toggle */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setAddToBill(!addToBill)}
                    activeOpacity={0.7}>
                    <Icon
                      name={addToBill ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={22}
                      color={addToBill ? colors.primary : colors.textMuted}
                    />
                    <AppText variant="body" style={styles.checkboxLabel}>
                      Add to Party Bill
                    </AppText>
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

                  {/* Add Photo */}
                  {photoUri ? (
                    <View style={styles.photoRow}>
                      <Image source={{uri: photoUri}} style={styles.photoPreview} />
                      <View style={styles.photoActions}>
                        <TouchableOpacity
                          style={styles.photoBtn}
                          onPress={() => setPhotoPickerVisible(true)}
                          activeOpacity={0.7}>
                          <Icon name="camera" size={16} color={colors.primary} />
                          <AppText variant="caption" style={styles.photoBtnText}>
                            Change
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.photoBtn, styles.photoBtnDanger]}
                          onPress={() => setPhotoUri(null)}
                          activeOpacity={0.7}>
                          <Icon name="trash-can-outline" size={16} color={colors.danger} />
                          <AppText variant="caption" style={styles.photoBtnDangerText}>
                            Remove
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addPhotoBtn}
                      onPress={() => setPhotoPickerVisible(true)}
                      activeOpacity={0.7}>
                      <Icon name="camera-plus-outline" size={20} color={colors.primary} />
                      <AppText variant="label" style={styles.addPhotoText}>
                        Add Photo (Camera / Gallery)
                      </AppText>
                    </TouchableOpacity>
                  )}

                  {/* Save Button */}
                  <AppButton
                    title={isPending ? 'Saving...' : 'Save'}
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

      {/* Expense Date Calendar Picker */}
      <DatePickerModal
        visible={datePickerVisible}
        initialDate={date}
        onSelectDate={setDate}
        onClose={() => setDatePickerVisible(false)}
        title="Select Payment Date"
      />

      {/* Expense Type Picker — separate full-screen modal */}
      <SelectOptionModal
        visible={typePickerVisible}
        title="Select Expense Type"
        options={expenseTypeOptions}
        topActions={expenseTopActions}
        selectedValue={expenseType?.name}
        onSelect={item => {
          if (typeof item === 'string') {
            setExpenseType({id: null, name: item});
          } else {
            setExpenseType({id: item.id, name: item.name || item.label || item.value});
          }
        }}
        onClose={() => setTypePickerVisible(false)}
        allowCustom
        placeholder="Search expense type..."
      />

      {/* Quick Add Custom Expense Type */}
      <QuickAddModal
        visible={quickAddVisible}
        type="expense"
        onAdd={handleQuickAddExpense}
        onClose={() => setQuickAddVisible(false)}
      />

      {/* Photo Source Picker */}
      <PhotoPickerModal
        visible={photoPickerVisible}
        onClose={() => setPhotoPickerVisible(false)}
        onCamera={takePhoto}
        onGallery={pickFromGallery}
      />
    </Modal>
  );
}

function PhotoPickerModal({visible, onClose, onCamera, onGallery}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.photoPickerOverlay}>
          <View style={styles.photoPickerCard}>
            <View style={styles.photoPickerHeader}>
              <AppText variant="heading" style={styles.photoPickerTitle}>
                Add Expense Photo
              </AppText>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.photoOptionRow}
              onPress={onCamera}
              activeOpacity={0.7}>
              <Icon name="camera" size={24} color={colors.primary} />
              <View style={styles.photoOptionInfo}>
                <AppText variant="body" style={styles.photoOptionTitle}>
                  Take Photo (Camera)
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Use camera to capture the expense photo
                </AppText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoOptionRow}
              onPress={onGallery}
              activeOpacity={0.7}>
              <Icon name="image-multiple" size={24} color={colors.success} />
              <View style={styles.photoOptionInfo}>
                <AppText variant="body" style={styles.photoOptionTitle}>
                  Select from Gallery
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Choose a photo from your device library
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    maxHeight: '92%',
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
  paymentSection: {
    gap: 4,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  addPhotoText: {
    color: colors.primary,
    fontWeight: '600',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoActions: {
    gap: spacing.sm,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  photoBtnDanger: {
    backgroundColor: colors.dangerSoft || '#FEE2E2',
  },
  photoBtnText: {
    color: colors.primary,
    fontWeight: '600',
  },
  photoBtnDangerText: {
    color: colors.danger,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
  },
  photoPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  photoPickerCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  photoPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  photoPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  photoOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  photoOptionInfo: {
    flex: 1,
  },
  photoOptionTitle: {
    fontWeight: '600',
  },
});
