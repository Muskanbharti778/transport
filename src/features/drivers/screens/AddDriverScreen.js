import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useAddDriverMutation} from '../hooks/useAddDriverMutation';
import {addDriverSchema} from '../driversValidation';
import {colors, radius, spacing, typography} from '../../../theme';

export default function AddDriverScreen() {
  const navigation = useNavigation();
  const [photoUri, setPhotoUri] = useState(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const {mutateAsync, isPending, error} = useAddDriverMutation();
  const submitError = error?.message || (error ? "Couldn't save this driver. Please try again." : null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(addDriverSchema),
    defaultValues: {
      drivername: '',
      mobile: '',
      opening_balance: '',
      balance_type: 'has_to_pay',
    },
  });

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'TransportApp needs access to your camera to take driver photos.',
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
    setPickerModalVisible(false);
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
    setPickerModalVisible(false);
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

  const onSubmit = async values => {
    try {
      await mutateAsync({
        ...values,
        opening_balance: values.opening_balance || undefined,
        driverphoto: photoUri,
      });
      navigation.goBack();
    } catch {
      // error is exposed via `error` from useAddDriverMutation below
    }
  };

  return (
    <AppScreen>
      <View style={styles.form}>
        <FormField
          control={control}
          name="drivername"
          label="Driver Name"
          placeholder="e.g. Suresh Yadav"
          error={errors.drivername?.message}
        />
        <FormField
          control={control}
          name="mobile"
          label="Mobile Number"
          placeholder="10-digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.mobile?.message}
        />
        <FormField
          control={control}
          name="opening_balance"
          label="Opening Balance"
          placeholder="0.00"
          keyboardType="decimal-pad"
          error={errors.opening_balance?.message}
        />
        <BalanceTypeField control={control} error={errors.balance_type?.message} />

        <PhotoField
          uri={photoUri}
          onPressUpload={() => setPickerModalVisible(true)}
          onClear={() => setPhotoUri(null)}
        />

        {submitError ? (
          <AppText variant="label" color="danger">
            {submitError}
          </AppText>
        ) : null}

        <AppButton
          title={isPending ? 'Saving...' : 'Save Driver'}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        />
      </View>

      <PhotoPickerModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onCamera={takePhoto}
        onGallery={pickFromGallery}
      />
    </AppScreen>
  );
}

function PhotoPickerModal({visible, onClose, onCamera, onGallery}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <AppText variant="heading" style={styles.modalTitle}>
                  Select Driver Photo
                </AppText>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                  <Icon name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalOptions}>
                <TouchableOpacity
                  style={styles.modalOptionBtn}
                  onPress={onCamera}
                  activeOpacity={0.7}>
                  <View style={[styles.modalOptionIcon, {backgroundColor: '#EFF6FF'}]}>
                    <Icon name="camera" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.modalOptionText}>
                    <AppText variant="body" style={styles.modalOptionTitle}>
                      Take Photo (Camera)
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      Use camera to capture photo
                    </AppText>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalOptionBtn}
                  onPress={onGallery}
                  activeOpacity={0.7}>
                  <View style={[styles.modalOptionIcon, {backgroundColor: '#F0FDF4'}]}>
                    <Icon name="image-multiple" size={24} color={colors.success} />
                  </View>
                  <View style={styles.modalOptionText}>
                    <AppText variant="body" style={styles.modalOptionTitle}>
                      Choose from Gallery
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      Select photo from device library
                    </AppText>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const BALANCE_TYPES = [
  {value: 'has_to_get', label: 'To Get', color: colors.success},
  {value: 'has_to_pay', label: 'To Pay', color: colors.danger},
];

function BalanceTypeField({control, error}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
        Balance Type
      </AppText>
      <Controller
        control={control}
        name="balance_type"
        render={({field: {onChange, value}}) => (
          <View style={styles.segmentRow}>
            {BALANCE_TYPES.map(option => {
              const selected = value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.segment,
                    selected && {
                      backgroundColor: option.color,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => onChange(option.value)}
                  activeOpacity={0.7}>
                  <AppText
                    style={[
                      styles.segmentLabel,
                      {color: selected ? colors.surface : colors.text},
                    ]}>
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

function PhotoField({uri, onPressUpload, onClear}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
        Driver Photo (Optional)
      </AppText>
      {uri ? (
        <View style={styles.photoContainer}>
          <Image source={{uri}} style={styles.photoPreview} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={onPressUpload} activeOpacity={0.7}>
              <Icon name="camera-retake-outline" size={16} color={colors.primary} />
              <AppText variant="caption" style={styles.photoBtnPrimaryText}>
                Change
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, styles.photoBtnDanger]} onPress={onClear} activeOpacity={0.7}>
              <Icon name="trash-can-outline" size={16} color={colors.danger} />
              <AppText variant="caption" style={styles.photoBtnDangerText}>
                Remove
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadBox} onPress={onPressUpload} activeOpacity={0.7}>
          <View style={styles.uploadIconWrap}>
            <Icon name="camera-plus-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.uploadTextWrap}>
            <AppText variant="body" style={styles.uploadTitle}>
              Add Driver Photo (Camera / Gallery)
            </AppText>
            <AppText variant="caption" color="textMuted">
              Take photo with camera or choose from gallery
            </AppText>
          </View>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function FormField({control, name, label, error, uppercase, ...inputProps}) {
  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
          {label}
        </AppText>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, onBlur, value}}) => (
          <TextInput
            value={value}
            onChangeText={text => onChange(uppercase ? text.toUpperCase() : text)}
            onBlur={onBlur}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, error && styles.inputError]}
            {...inputProps}
          />
        )}
      />
      {error ? (
        <AppText variant="caption" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {gap: spacing.lg},
  field: {gap: spacing.xs},
  fieldLabel: {textTransform: 'uppercase', letterSpacing: 0.5},
  input: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  segmentLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    lineHeight: 20,
    flexShrink: 0,
    minWidth: 64,
    textAlign: 'center',
  },
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSubtle,
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  photoBtnPrimaryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  photoBtnDanger: {
    borderColor: colors.danger,
  },
  photoBtnDangerText: {
    color: colors.danger,
    fontWeight: '600',
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  uploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextWrap: {
    flex: 1,
  },
  uploadTitle: {
    fontWeight: '600',
    color: colors.text,
    fontSize: typography.sizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl || 20,
    borderTopRightRadius: radius.xl || 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl || 32,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  modalOptions: {
    gap: spacing.sm,
  },
  modalOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 15,
  },
});
