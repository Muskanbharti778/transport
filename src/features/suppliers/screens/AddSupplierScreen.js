import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useAddSupplierMutation} from '../hooks/useAddSupplierMutation';
import {addSupplierSchema} from '../suppliersValidation';
import {colors, radius, spacing, typography} from '../../../theme';

export default function AddSupplierScreen() {
  const navigation = useNavigation();
  const {mutateAsync, isPending, error} = useAddSupplierMutation();
  const submitError =
    error?.message || (error ? "Couldn't save this supplier. Please try again." : null);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      suppliername: '',
      mobile: '',
      email: '',
      address: '',
      pincode: '',
      gstNumber: '',
      panNumber: '',
      contactperson: '',
    },
  });

  const onSubmit = async values => {
    try {
      await mutateAsync({
        ...values,
        mobile: values.mobile || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        contactperson: values.contactperson || undefined,
      });
      navigation.goBack();
    } catch {
      // error is exposed via `error` from useAddSupplierMutation below
    }
  };

  return (
    <AppScreen>
      <View style={styles.form}>
        <FormField
          control={control}
          name="suppliername"
          label="Supplier Name"
          placeholder="e.g. Bharat Diesel Traders"
          error={errors.suppliername?.message}
        />
        <FormField
          control={control}
          name="contactperson"
          label="Contact Person"
          placeholder="e.g. Rakesh"
          error={errors.contactperson?.message}
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
          name="email"
          label="Email"
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />
        <FormField
          control={control}
          name="address"
          label="Address"
          placeholder="Address"
          error={errors.address?.message}
        />

        <View style={styles.row}>
          <View style={styles.rowFieldWide}>
            <FormField
              control={control}
              name="gstNumber"
              label="GST Number"
              placeholder="15-char GST"
              autoCapitalize="characters"
              uppercase
              error={errors.gstNumber?.message}
            />
          </View>
          <View style={styles.rowField}>
            <FormField
              control={control}
              name="panNumber"
              label="PAN"
              placeholder="PAN"
              autoCapitalize="characters"
              uppercase
              error={errors.panNumber?.message}
            />
          </View>
        </View>

        {submitError ? (
          <AppText variant="label" color="danger">
            {submitError}
          </AppText>
        ) : null}

        <AppButton
          title={isPending ? 'Saving...' : 'Save Supplier'}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        />
      </View>
    </AppScreen>
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowFieldWide: {
    flex: 1,
  },
  rowField: {
    flex: 1,
  },
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
});
