import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppButton} from '../../../components/common/AppButton';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useMockOtpVerification} from '../hooks/useMockOtpVerification';
import {colors, radius, spacing, typography} from '../../../theme';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen({route, navigation}) {
  const mobileNumber = route.params?.mobileNumber;
  const {verifyOtp, isSubmitting, errorMessage} = useMockOtpVerification();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  const otp = useMemo(() => digits.join(''), [digits]);
  const isComplete = otp.length === OTP_LENGTH;

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleChangeDigit = (value, index) => {
    // Handles pasted multi-digit input landing in one box
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      setDigits(prev => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    setDigits(prev => {
      const next = [...prev];
      for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
        next[index + i] = cleaned[i];
      }
      return next;
    });

    const nextIndex = Math.min(index + cleaned.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyPress = ({nativeEvent}, index) => {
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // TODO: wire to real resend-OTP mutation once backend contract exists
  };

  return (
    <AppScreen>
      <AppHeader
        title="Verify your number"
        subtitle={`Enter the ${OTP_LENGTH}-digit code sent to ${mobileNumber || 'your number'}`}
      />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeNumber}>
        <AppText variant="label" color="primary">
          Change number
        </AppText>
      </TouchableOpacity>

      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            value={digit}
            onChangeText={value => handleChangeDigit(value, index)}
            onKeyPress={event => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={2}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            accessibilityLabel={`OTP digit ${index + 1}`}
          />
        ))}
      </View>

      {errorMessage ? (
        <AppText variant="label" style={styles.errorText}>
          {errorMessage}
        </AppText>
      ) : null}

      <AppButton
        title={isSubmitting ? 'Verifying...' : 'Verify & Continue'}
        onPress={() => verifyOtp(mobileNumber, otp)}
        disabled={!isComplete || isSubmitting}
        style={styles.verifyButton}
      />

      <View style={styles.resendRow}>
        {secondsLeft > 0 ? (
          <AppText variant="caption" color="textMuted">
            Resend code in 0:{secondsLeft.toString().padStart(2, '0')}
          </AppText>
        ) : (
          <TouchableOpacity onPress={handleResend}>
            <AppText variant="label" color="primary">
              Resend OTP
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* <View style={styles.mockBadge}>
        <AppText variant="caption" color="textMuted">
          Dev mode: any 6 digits will pass mock verification
        </AppText>
      </View> */}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  changeNumber: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  verifyButton: {
    marginTop: spacing.sm,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  mockBadge: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
});