import React, {useMemo, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useAddPartyMutation} from '../hooks/useAddPartyMutation';
import {addPartySchema} from '../partiesValidation';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing, typography} from '../../../theme';
import {useStatesQuery} from '../../states/hooks/useStatesQuery';
//import {routes} from '../../../navigation/routeNames';

export default function AddPartyScreen() {
  const navigation = useNavigation();
  const {mutateAsync, isPending, error} = useAddPartyMutation();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(addPartySchema),
    defaultValues: {
      name: '',
      companyName: '',
      gstNumber: '',
      panNumber: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      state: '',
      pincode: '',
      openingBalance: '',
    },
  });

  const onSubmit = async values => {
    await mutateAsync(values);
    navigation.goBack();
  };

  // Surfacing the backend's own message instead of a generic string: the
  // Laravel PartyController returns 422 "Validation failed" with per-field
  // errors (e.g. a duplicate mobile), which is the actionable reason the user
  // needs to see.
  const submitError = useMemo(() => {
    if (!error) return null;
    const fieldErrors = error?.data?.errors;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const firstMessage = Object.values(fieldErrors).flat()[0];
      if (firstMessage) return firstMessage;
    }
    return (
      error?.message || "Couldn't save this party. Please try again."
    );
  }, [error]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}>
      <AppScreen>
        <View style={styles.form}>
        <FormField
          control={control}
          name="name"
          label="Party Name *"
          placeholder="Party Name"
          error={errors.name?.message}
        />
        <FormField
          control={control}
          name="companyName"
          label="Company Name"
          placeholder="Company Name"
          error={errors.companyName?.message}
        />

        <View style={styles.row}>
          <View style={styles.rowField}>
            <FormField
              control={control}
              name="gstNumber"
              label="Gst"
              placeholder="GST Number"
              autoCapitalize="characters"
              uppercase
              error={errors.gstNumber?.message}
            />
          </View>
          <View style={styles.rowField}>
            <FormField
              control={control}
              name="panNumber"
              label="Pan Number"
              placeholder="PAN Number"
              autoCapitalize="characters"
              uppercase
              error={errors.panNumber?.message}
            />
          </View>
        </View>

        <FormField
          control={control}
          name="phoneNumber"
          label="Mobile Number *"
          placeholder="Mobile Number"
          keyboardType="number-pad"
          error={errors.phoneNumber?.message}
        />
        <FormField
          control={control}
          name="addressLine1"
          label="Address 1 *"
          placeholder="Address Line 1"
          error={errors.addressLine1?.message}
        />
        <FormField
          control={control}
          name="addressLine2"
          label="Address 2"
          placeholder="Address Line 2"
          error={errors.addressLine2?.message}
        />

        <View style={styles.row}>
          <View style={styles.rowFieldWide}>
            {/* <StateField control={control} navigation={navigation} error={errors.state?.message} /> */}
            <StateField control={control} error={errors.state?.message} />
          </View>
          <View style={styles.rowField}>
            <FormField
              control={control}
              name="pincode"
              label="pincode *"
              placeholder="6-digit pincode"
              keyboardType="number-pad"
              error={errors.pincode?.message}
            />
          </View>
        </View>

        <FormField
          control={control}
          name="openingBalance"
          placeholder="Opening balance"
          keyboardType="decimal-pad"
          error={errors.openingBalance?.message}
        />

        {submitError ? (
          <AppText variant="label" color="danger">
            {submitError}
          </AppText>
        ) : null}

        <AppButton
          title={isPending ? 'Saving...' : 'Save Party'}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        />
      </View>
      </AppScreen>
    </KeyboardAvoidingView>
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

// function StateField({control, navigation, error}) {
//   return (
//     <View style={styles.field}>
//       <Controller
//         control={control}
//         name="state"
//         render={({field: {onChange, value}}) => (
//           <TouchableOpacity
//             style={[styles.input, styles.selectInput, error && styles.inputError]}
//             onPress={() =>
//               navigation.navigate(routes.selectState, {
//                 selectedState: value,
//                 onSelect: onChange,
//               })
//             }>
//             <AppText
//               variant="body"
//               color={value ? 'text' : 'textMuted'}
//               numberOfLines={1}
//               style={styles.selectText}>
//               {value || 'Select state'}
//             </AppText>
//             <Icon name="chevron-down" size={18} color={colors.textMuted} />
//           </TouchableOpacity>
//         )}
//       />
//       {error ? (
//         <AppText variant="caption" color="danger">
//           {error}
//         </AppText>
//       ) : null}
//     </View>
//   );
// }

 function StateField({control, error}) {
  const {data: states = [], isLoading} = useStatesQuery();
  const [stateListVisible, setStateListVisible] = useState(false);

  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted" style={styles.fieldLabel}>
        State *
      </AppText>

      <Controller
        control={control}
        name="state"
        render={({field: {onChange, value}}) => (
          <>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, error && styles.inputError]}
              onPress={() => setStateListVisible(previous => !previous)}
              activeOpacity={0.7}>
              <AppText
                variant="body"
                color={value ? 'text' : 'textMuted'}
                numberOfLines={1}
                style={styles.selectText}>
                {value || 'Select state'}
              </AppText>

              <Icon
                name={stateListVisible ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {stateListVisible ? (
              <View style={styles.stateDropdown}>
                {isLoading ? (
                  <AppText variant="body" color="textMuted" style={styles.loadingText}>
                    Loading states...
                  </AppText>
                ) : (
                  <ScrollView
                    style={styles.stateScroll}
                    nestedScrollEnabled
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="handled">
                    {states.map(state => {
                      const selected = value === state.name;

                      return (
                        <TouchableOpacity
                          key={state.id}
                          style={[
                            styles.stateOption,
                            selected && styles.selectedStateOption,
                          ]}
                          onPress={() => {
                            onChange(state.name);
                            setStateListVisible(false);
                          }}
                          activeOpacity={0.7}>
                          <AppText
                            variant="body"
                            style={[
                              styles.stateOptionText,
                              selected && styles.selectedStateOptionText,
                            ]}>
                            {state.name}
                          </AppText>

                          {selected ? (
                            <Icon name="check" size={20} color={colors.primary} />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            ) : null}
          </>
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
  keyboardView: {flex: 1},
  form: {gap: spacing.lg},
  field: {gap: spacing.xs},
  fieldLabel: {textTransform: 'uppercase', letterSpacing: 0.5},
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  rowFieldWide: {
    flex: 1.4,
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
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flexShrink: 1,
  },
  stateOptions: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
  overflow: 'hidden',
},

// stateOption: {
//   minHeight: 48,
//   flexDirection: 'row',
//   alignItems: 'center',
//   justifyContent: 'space-between',
//   paddingHorizontal: spacing.md,
//   borderBottomWidth: 1,
//   borderBottomColor: colors.border,
// },

// selectedStateOption: {
//   backgroundColor: colors.primarySoft,
// },

// stateOptionText: {
//   color: colors.text,
// },

// selectedStateOptionText: {
//   color: colors.primary,
//   fontWeight: '600',
// },
stateDropdown: {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
  overflow: 'hidden',
},

stateScroll: {
  maxHeight: 220,
},

loadingText: {
  padding: spacing.md,
},

stateOption: {
  minHeight: 48,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
},

selectedStateOption: {
  backgroundColor: colors.primarySoft,
},

stateOptionText: {
  color: colors.text,
},

selectedStateOptionText: {
  color: colors.primary,
  fontWeight: '600',
},
});