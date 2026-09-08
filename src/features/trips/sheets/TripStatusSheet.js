import React, {useState} from 'react';
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
import {DatePickerModal} from '../components/DatePickerModal';
import {colors, radius, spacing} from '../../../theme';

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getFormattedToday() {
  const now = new Date();
  return `${now.getDate()} ${SHORT_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

const PAYMENT_MODES = ['Cash', 'Cheque', 'UPI', 'Bank Transfer', 'Other'];

function sheetConfig(status) {
  switch (status) {
    case 'Completed':
      return {
        title: 'Complete Trip',
        subtitle: 'Record the end reading for this trip.',
        showEndKm: true,
        showPhoto: false,
        showAmount: false,
        dateLabel: 'Trip End Date',
        saveLabel: 'Mark Complete',
      };
    case 'POD Received':
      return {
        title: 'Mark POD Received',
        subtitle: 'Record when the delivery proof was received.',
        showEndKm: false,
        showPhoto: true,
        showAmount: false,
        dateLabel: 'POD Received Date',
        saveLabel: 'Confirm',
      };
    case 'POD Submitted':
      return {
        title: 'Mark POD Submitted',
        subtitle: 'Record when the delivery proof was submitted.',
        showEndKm: false,
        showPhoto: false,
        showAmount: false,
        dateLabel: 'POD Submitted Date',
        saveLabel: 'Confirm',
      };
    case 'Settled':
      return {
        title: 'Settle Party',
        subtitle: 'Record the settlement amount for this trip.',
        showEndKm: false,
        showPhoto: false,
        showAmount: true,
        dateLabel: 'Settlement Date',
        saveLabel: 'Settle Party',
      };
    default:
      return {
        title: 'Update Status',
        subtitle: '',
        showEndKm: false,
        showPhoto: false,
        showAmount: false,
        dateLabel: 'Date',
        saveLabel: 'Confirm',
      };
  }
}

const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

export function TripStatusSheet({visible, status, onConfirm, onClose, isPending}) {
  const [date, setDate] = useState(getFormattedToday());
  const [endKm, setEndKm] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODES[0]);
  const [photo, setPhoto] = useState(null); // {uri, base64, mime}
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);

  const config = sheetConfig(status);

  // Reset fields each time the sheet opens with a fresh status.
  React.useEffect(() => {
    if (visible) {
      setDate(getFormattedToday());
      setEndKm('');
      setSettlementAmount('');
      setPaymentMode(PAYMENT_MODES[0]);
      setPhoto(null);
    }
  }, [visible, status]);

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'TransportApp needs access to your camera to capture the POD photo.',
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
    handleImagePick(() =>
      launchCamera({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.6,
        includeBase64: true,
        saveToPhotos: false,
      }),
    );
  };

  const pickFromGallery = async () => {
    setPhotoPickerVisible(false);
    handleImagePick(() =>
      launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.6,
        includeBase64: true,
      }),
    );
  };

  const handleImagePick = async picker => {
    try {
      const result = await picker();
      if (result.didCancel || result.errorCode) {
        return;
      }
      const asset = result.assets?.[0];
      if (asset?.uri) {
        setPhoto({
          uri: asset.uri,
          base64: asset.base64 || null,
          mime: asset.type || 'image/jpeg',
        });
      }
    } catch {
      // Photo picker cancelled or error ignored
    }
  };

  const buildPhotoBase64 = () => {
    if (!photo?.base64) return null;
    return `data:${photo.mime};base64,${photo.base64}`;
  };

  const handleConfirm = () => {
    onConfirm({
      status,
      date,
      endKm: endKm.trim(),
      photoBase64: config.showPhoto ? buildPhotoBase64() : null,
      amount: settlementAmount.trim(),
      paymentMode,
    });
  };

  const amountIsValid = config.showAmount
    ? AMOUNT_REGEX.test(settlementAmount.trim()) && Number(settlementAmount) > 0
    : true;

  const canConfirm = Boolean(date) && amountIsValid && !isPending;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}>
              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Header */}
                <View style={styles.header}>
                  <View>
                    <AppText variant="heading" style={styles.title}>
                      {config.title}
                    </AppText>
                    {config.subtitle ? (
                      <AppText variant="caption" color="textMuted">
                        {config.subtitle}
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

                <View style={styles.form}>
                  {/* End KM (optional) — only for Completed */}
                  {config.showEndKm ? (
                    <View style={styles.fieldWrapper}>
                      <View style={styles.inputWithSuffix}>
                        <TextInput
                          value={endKm}
                          onChangeText={setEndKm}
                          placeholder="End KM (optional)"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          style={styles.flexInput}
                        />
                        <Icon name="counter" size={20} color={colors.primary} />
                      </View>
                    </View>
                  ) : null}

                  {/* Settlement amount + payment mode — only for Settled */}
                  {config.showAmount ? (
                    <>
                      <View style={styles.fieldWrapper}>
                        <View style={styles.inputWithSuffix}>
                          <TextInput
                            value={settlementAmount}
                            onChangeText={setSettlementAmount}
                            placeholder="Settlement Amount"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="decimal-pad"
                            style={styles.flexInput}
                          />
                          <Icon name="currency-inr" size={20} color={colors.primary} />
                        </View>
                      </View>
                      <View style={styles.fieldWrapper}>
                        <AppText variant="caption" color="textMuted" style={styles.modeLabel}>
                          Payment Mode
                        </AppText>
                        <View style={styles.modeRow}>
                          {PAYMENT_MODES.map(mode => {
                            const selected = paymentMode === mode;
                            return (
                              <TouchableOpacity
                                key={mode}
                                onPress={() => setPaymentMode(mode)}
                                activeOpacity={0.7}
                                style={[styles.modeChip, selected && styles.modeChipActive]}>
                                <AppText
                                  variant="caption"
                                  style={[
                                    styles.modeChipText,
                                    selected && styles.modeChipTextActive,
                                  ]}>
                                  {mode}
                                </AppText>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </>
                  ) : null}

                  {/* Date (defaults to today, selectable) */}
                  <TouchableOpacity
                    style={styles.fieldWrapper}
                    onPress={() => setDatePickerVisible(true)}
                    activeOpacity={0.7}>
                    <View style={styles.floatingLabel}>
                      <AppText variant="caption" color="textMuted" style={styles.labelText}>
                        {config.dateLabel}
                      </AppText>
                    </View>
                    <View style={styles.inputWithSuffix}>
                      <AppText variant="body" style={[styles.flexInputText, !date && styles.placeholderText]}>
                        {date || 'Select date'}
                      </AppText>
                      <Icon name="calendar-month-outline" size={20} color={colors.primary} />
                    </View>
                  </TouchableOpacity>

                  {/* POD photo (optional) — only for POD Received */}
                  {config.showPhoto ? (
                    photo ? (
                      <View style={styles.photoRow}>
                        <Image source={{uri: photo.uri}} style={styles.photoPreview} />
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
                            onPress={() => setPhoto(null)}
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
                          Attach POD Photo (optional)
                        </AppText>
                      </TouchableOpacity>
                    )
                  ) : null}

                  <AppButton
                    title={isPending ? 'Saving...' : config.saveLabel}
                    onPress={handleConfirm}
                    disabled={!canConfirm}
                    style={styles.saveBtn}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={date}
        onSelectDate={setDate}
        onClose={() => setDatePickerVisible(false)}
        title={config.dateLabel}
      />

      <PhotoSourceModal
        visible={photoPickerVisible}
        onClose={() => setPhotoPickerVisible(false)}
        onCamera={takePhoto}
        onGallery={pickFromGallery}
      />
    </Modal>
  );
}

function PhotoSourceModal({visible, onClose, onCamera, onGallery}) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.photoPickerOverlay}>
          <View style={styles.photoPickerCard}>
            <View style={styles.photoPickerHeader}>
              <AppText variant="heading" style={styles.photoPickerTitle}>
                Attach POD Photo
              </AppText>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.photoOptionRow} onPress={onCamera} activeOpacity={0.7}>
              <Icon name="camera" size={24} color={colors.primary} />
              <View style={styles.photoOptionInfo}>
                <AppText variant="body" style={styles.photoOptionTitle}>
                  Take Photo (Camera)
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Capture the delivery proof document
                </AppText>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoOptionRow} onPress={onGallery} activeOpacity={0.7}>
              <Icon name="image-multiple" size={24} color={colors.success} />
              <View style={styles.photoOptionInfo}>
                <AppText variant="body" style={styles.photoOptionTitle}>
                  Select from Gallery
                </AppText>
                <AppText variant="caption" color="textMuted">
                  Choose a POD photo from your device
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
    maxHeight: '88%',
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
    gap: spacing.md,
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
  modeLabel: {
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  modeChipText: {
    color: colors.text,
    fontWeight: '500',
  },
  modeChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
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