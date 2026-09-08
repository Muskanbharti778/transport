import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useAddTruckMutation} from '../hooks/useAddTruckMutation';
import {useSuppliersQuery} from '../../suppliers/hooks/useSuppliersQuery';
import {SelectOptionModal} from '../../trips/components/SelectOptionModal';
import {addTruckSchema} from '../trucksValidation';
import {mockVehicleTypes} from '../trucks.mock';
import {colors, radius, spacing, typography} from '../../../theme';

export default function AddTruckScreen() {
  const navigation = useNavigation();
  const {data: suppliers = []} = useSuppliersQuery();
  const {mutateAsync, isPending, error} = useAddTruckMutation();
  const submitError =
    error?.message || (error ? "Couldn't save this truck. Please try again." : null);

  const [vehicleTypeModal, setVehicleTypeModal] = useState(false);
  const [ownershipModal, setOwnershipModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(addTruckSchema),
    defaultValues: {
      vehicleNumber: '',
      vehicleType: '',
      ownership: 'own',
      supplierId: '',
    },
  });

  const vehicleType = watch('vehicleType');
  const ownership = watch('ownership');
  const supplierId = watch('supplierId');
  const supplierName =
    suppliers.find(s => s.id === String(supplierId))?.suppliername || '';

  const onSubmit = async values => {
    try {
      await mutateAsync({
        ...values,
        supplierId: values.ownership === 'market' ? values.supplierId || undefined : undefined,
      });
      navigation.goBack();
    } catch {
      // error is exposed via `error` from useAddTruckMutation below
    }
  };

  const selectVehicleType = option => {
    const value = typeof option === 'string' ? option : option.name || option.value;
    setValue('vehicleType', value, {shouldValidate: true});
  };

  const selectOwnership = option => {
    const value = typeof option === 'string' ? option : option.value;
    setValue('ownership', value, {shouldValidate: true});
    if (value === 'own') {
      setValue('supplierId', '', {shouldValidate: true});
    }
  };

  const selectSupplier = option => {
    if (option && typeof option === 'object' && option.id) {
      setValue('supplierId', String(option.id), {shouldValidate: true});
      return;
    }
    const match = suppliers.find(s => s.suppliername === option);
    setValue('supplierId', match ? String(match.id) : '', {shouldValidate: true});
  };

  return (
    <AppScreen>
      <View style={styles.form}>
        <FormField
          control={control}
          name="vehicleNumber"
          label="Vehicle Number"
          placeholder="e.g. KA 01 AH 5421"
          autoCapitalize="characters"
          uppercase
          error={errors.vehicleNumber?.message}
        />

        <SelectField
          label="Vehicle Type"
          placeholder="Select vehicle type"
          value={vehicleType}
          onPress={() => setVehicleTypeModal(true)}
        />

        <SelectField
          label="Ownership"
          placeholder="Select ownership"
          value={ownership === 'own' ? 'Own' : ownership === 'market' ? 'Market' : ''}
          onPress={() => setOwnershipModal(true)}
        />

        {ownership === 'market' ? (
          <SelectField
            label="Supplier"
            placeholder={supplierName || 'Select supplier'}
            value={supplierName}
            valueTone={supplierName ? 'text' : 'textMuted'}
            onPress={() => setSupplierModal(true)}
          />
        ) : null}

        {submitError ? (
          <AppText variant="label" color="danger">
            {submitError}
          </AppText>
        ) : null}

        <AppButton
          title={isPending ? 'Saving...' : 'Save Truck'}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        />
      </View>

      <SelectOptionModal
        visible={vehicleTypeModal}
        title="Vehicle Type"
        options={mockVehicleTypes}
        selectedValue={vehicleType}
        onSelect={selectVehicleType}
        onClose={() => setVehicleTypeModal(false)}
        allowCustom={false}
        placeholder="Search vehicle types..."
      />

      <SelectOptionModal
        visible={ownershipModal}
        title="Ownership"
        options={[
          {value: 'own', name: 'Own'},
          {value: 'market', name: 'Market'},
        ]}
        selectedValue={ownership}
        onSelect={selectOwnership}
        onClose={() => setOwnershipModal(false)}
        allowCustom={false}
        placeholder="Search ownership..."
      />

      <SelectOptionModal
        visible={supplierModal}
        title="Select Supplier"
        options={suppliers.map(s => ({id: s.id, name: s.suppliername}))}
        selectedValue={supplierId}
        onSelect={selectSupplier}
        onClose={() => setSupplierModal(false)}
        allowCustom={false}
        placeholder="Search suppliers..."
      />
    </AppScreen>
  );
}

function SelectField({label, value, valueTone = 'text', placeholder, onPress}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TouchableOpacity style={[styles.input, styles.selectInput]} onPress={onPress}>
        <AppText
          variant="body"
          color={value ? valueTone : 'textMuted'}
          numberOfLines={1}
          style={styles.selectText}>
          {value || placeholder}
        </AppText>
        <Icon name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function FormField({control, name, label, error, uppercase, ...inputProps}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
        {label}
      </AppText>
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
    justifyContent: 'center',
  },
  inputError: {
    borderColor: colors.danger,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flexShrink: 1,
  },
});
