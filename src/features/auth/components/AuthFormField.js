import React, {useState} from 'react';
import {Controller} from 'react-hook-form';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

export function AuthFormField({
  control,
  name,
  label,
  placeholder,
  error,
  secureTextEntry,
  ...inputProps
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({field: {onChange, onBlur, value}}) => (
          <View style={[styles.inputWrapper, error && styles.inputError]}>
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor="#94A3B8"
              secureTextEntry={isSecure}
              style={styles.input}
              selectionColor={colors.primary2}
              {...inputProps}
            />
            {secureTextEntry ? (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeBtn}
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}>
                <Icon
                  name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
      {error ? (
        <AppText variant="caption" color="danger" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  label: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: radius.md + 4,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#121826',
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});