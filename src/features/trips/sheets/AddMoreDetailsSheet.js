import React, {useState, useEffect} from 'react';
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
import {colors, radius, spacing} from '../../../theme';

export function AddMoreDetailsSheet({
  visible,
  initialValues = {},
  onSave,
  onClose,
  tripNoReadonly = false,
}) {
  const [lrNumber, setLrNumber] = useState(initialValues.lrNumber || '');
  const [material, setMaterial] = useState(initialValues.material || '');
  const [startKm, setStartKm] = useState(initialValues.startKm || '');
  const [note, setNote] = useState(initialValues.note || '');

  useEffect(() => {
    if (visible) {
      setLrNumber(initialValues.lrNumber || '');
      setMaterial(initialValues.material || '');
      setStartKm(initialValues.startKm || '');
      setNote(initialValues.note || '');
    }
  }, [visible, initialValues]);

  const handleSave = () => {
    onSave({
      lrNumber: lrNumber.trim(),
      material: material.trim(),
      startKm: startKm.trim(),
      note: note.trim(),
    });
    onClose();
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
                <AppText variant="heading" style={styles.title}>
                  Add More Details
                </AppText>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessibilityLabel="Close">
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Trip/LR No */}
                <View style={styles.fieldWrapper}>
                  <View style={styles.floatingLabel}>
                    <AppText variant="caption" color="textMuted" style={styles.labelText}>
                      Trip/LR No
                    </AppText>
                  </View>
                  <TextInput
                    value={lrNumber}
                    editable={!tripNoReadonly}
                    placeholder="LRN-001"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, tripNoReadonly && styles.disabledInput]}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Material */}
                <View style={styles.fieldWrapper}>
                  <TextInput
                    value={material}
                    onChangeText={setMaterial}
                    placeholder="Material"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                </View>

                {/* Start KM */}
                <View style={styles.fieldWrapper}>
                  <View style={styles.floatingLabel}>
                    <AppText variant="caption" color="textMuted" style={styles.labelText}>
                      Start KM
                    </AppText>
                  </View>
                  <View style={styles.inputWithSuffix}>
                    <TextInput
                      value={startKm}
                      onChangeText={setStartKm}
                      placeholder="Start KM"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      style={styles.flexInput}
                    />
                    <AppText variant="label" color="textMuted" style={styles.suffixText}>
                      KM
                    </AppText>
                  </View>
                </View>

                {/* Note */}
                <View style={styles.fieldWrapper}>
                  <View style={styles.inputWithPrefix}>
                    <Icon name="menu" size={20} color={colors.textMuted} />
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Note"
                      placeholderTextColor={colors.textMuted}
                      style={styles.flexInput}
                      multiline
                    />
                  </View>
                </View>

                {/* Save Button */}
                <AppButton
                  title="Save"
                  onPress={handleSave}
                  style={styles.saveBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
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
  disabledInput: {
    backgroundColor: colors.surfaceSubtle,
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
  inputWithPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
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
  suffixText: {
    fontWeight: '600',
    fontSize: 13,
  },
  saveBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: radius.md,
  },
});
