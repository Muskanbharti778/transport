import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, TextInput, View} from 'react-native';
import {AppButton} from '../../../components/common/AppButton';
import {AppCard} from '../../../components/common/AppCard';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {routes} from '../../../navigation/routeNames';
import {useMockLoginRequest} from '../hooks/useMockLoginRequest';
import {colors, radius, spacing, typography} from '../../../theme';

export default function LoginScreen({navigation}) {
  const [mobileNumber, setMobileNumber] = useState('');
  const {requestOtp, isSubmitting, errorMessage} = useMockLoginRequest();

  const handleSubmit = async () => {
    const result = await requestOtp(mobileNumber.trim());
    navigation.navigate(routes.otp, {mobileNumber: result.mobileNumber});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}>
      <AppScreen>
        <AppHeader
          title="Enter mobile number"
          //subtitle="This screen captures only the mobile number until the backend defines the login contract."
        />
        <AppCard style={styles.card}>
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <AppText variant="label">Mobile number</AppText>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <AppText variant="label">+91</AppText>
                </View>
                <TextInput
                  accessibilityLabel="Mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onChangeText={setMobileNumber}
                  placeholder="98765 43210"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={mobileNumber}
                />
              </View>
            </View>

            {errorMessage ? (
              <AppText variant="label" style={styles.errorText}>
                {errorMessage}
              </AppText>
            ) : null}

            <AppButton
              title={isSubmitting ? 'Sending...' : 'Send OTP'}
              disabled={!mobileNumber.trim() || isSubmitting}
              onPress={handleSubmit}
            />
          </View>
          {/* <AppText variant="caption" color="textMuted">
            Mock action: no request is sent to the backend in this build.
          </AppText> */}
        </AppCard>
      </AppScreen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  card: {
    gap: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  phoneInputRow: {
    minHeight: 52,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  countryCode: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
  },
});
