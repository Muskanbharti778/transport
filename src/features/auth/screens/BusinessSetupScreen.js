import React, {useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppText} from '../../../components/common/AppText';
import {useAuthStore} from '../../../store/authStore';
import {useSendMobileOtp} from '../hooks/useSendMobileOtp';
import {useVerifyMobileOtp} from '../hooks/useVerifyMobileOtp';
import {useCreateCompany} from '../hooks/useCreateCompany';
import {colors, radius, spacing} from '../../../theme';

const OTP_LENGTH = 6;

export default function BusinessSetupScreen() {
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);
  const logout = useAuthStore(state => state.logout);
  const {sendOtp, isSending, errorMessage: sendOtpError} = useSendMobileOtp();
  const {verifyOtp, isVerifying, errorMessage: otpError} = useVerifyMobileOtp();
  const {createCompany, isCreating, errorMessage: submitError} = useCreateCompany();

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpVisible, setOtpVisible] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otp = digits.join('');

  const handleVerifyMobilePress = async () => {
    if (mobileNumber.length < 10) return;
    await sendOtp(mobileNumber);
    setOtpVisible(true);
  };

  const handleChangeDigit = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = ({nativeEvent}, index) => {
    if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpPress = async () => {
    const result = await verifyOtp(mobileNumber, otp);
    if (result?.verified) {
      setMobileVerified(true);
      setOtpVisible(false);
    }
  };

  const handleComplete = async () => {
    if (!mobileVerified || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createCompany({
        ownername: name,
        companyname: businessName,
        mobile: mobileNumber,
      });
      completeOnboarding({name, businessName, mobileNumber, mobileVerified});
    } catch {
      // Error message surfaced via submitError below.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Top Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={logout} style={styles.backButton} hitSlop={10}>
              <Icon name="arrow-left" size={22} color={colors.primary2} />
              <AppText variant="label" color="primary2" style={styles.backText}>
                Login
              </AppText>
            </TouchableOpacity>
            <AppText variant="title" style={styles.brandTitle}>
              TransportApp
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Main White Floating Card */}
          <View style={styles.mainCard}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <AppText variant="heading" style={styles.titleLine1}>
                Business Setup
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                Tell us about you and your business
              </AppText>
            </View>

            {/* Input Fields */}
            <View style={styles.formFields}>
              <Field
                label="Owner name"
                value={name}
                onChangeText={setName}
                placeholder="Full name"
              />

              <Field
                label="Business name"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. ABC Transport Co."
              />

              <View style={styles.field}>
                <AppText variant="label" style={styles.label}>
                  Mobile number
                </AppText>
                <View style={styles.mobileRow}>
                  <View style={styles.mobileInputWrapper}>
                    <TextInput
                      value={mobileNumber}
                      onChangeText={setMobileNumber}
                      placeholder="10-digit number"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      maxLength={10}
                      editable={!mobileVerified}
                      style={styles.input}
                      selectionColor={colors.primary2}
                    />
                  </View>

                  {mobileVerified ? (
                    <View style={styles.verifiedBadge}>
                      <Icon name="check-circle" size={18} color={colors.success} />
                      <AppText variant="caption" color="success" style={styles.verifiedText}>
                        Verified
                      </AppText>
                    </View>
                  ) : (
                    <AppButton
                      title={isSending ? 'Sending...' : 'Verify'}
                      onPress={handleVerifyMobilePress}
                      disabled={isSending || mobileNumber.length < 10}
                      style={styles.verifyMobileButton}
                    />
                  )}
                </View>
                {sendOtpError ? (
                  <AppText variant="caption" color="danger" style={styles.otpErrorText}>
                    {sendOtpError}
                  </AppText>
                ) : null}
              </View>

              {otpVisible && !mobileVerified ? (
                <View style={styles.otpSection}>
                  <AppText variant="caption" style={styles.otpHint}>
                    Enter the 6-digit code sent to {mobileNumber}
                  </AppText>
                  <View style={styles.otpRow}>
                    {digits.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={ref => (inputRefs.current[index] = ref)}
                        value={digit}
                        onChangeText={value => handleChangeDigit(value, index)}
                        onKeyPress={event => handleKeyPress(event, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      />
                    ))}
                  </View>
                  {otpError ? (
                    <AppText variant="caption" color="danger" style={styles.otpErrorText}>
                      {otpError}
                    </AppText>
                  ) : null}
                  <View style={styles.otpBtnRow}>
                    <AppButton
                      title={isVerifying ? 'Verifying...' : 'Verify OTP'}
                      onPress={handleVerifyOtpPress}
                      disabled={otp.length !== OTP_LENGTH || isVerifying}
                      style={styles.otpVerifyButton}
                    />
                  </View>
                </View>
              ) : null}
            </View>

            {/* Primary Action Button */}
            {submitError ? (
              <AppText variant="caption" color="danger" style={styles.submitErrorText}>
                {submitError}
              </AppText>
            ) : null}
            <AppButton
              title={isCreating || isSubmitting ? 'Setting up...' : 'Complete Signup'}
              onPress={handleComplete}
              disabled={!mobileVerified || isCreating || isSubmitting}
              style={[
                styles.completeButton,
                !mobileVerified && styles.completeButtonDisabled,
              ]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({label, placeholder, ...inputProps}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          selectionColor={colors.primary2}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F8',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#EEF3F8',
    paddingBottom: spacing['2xl'],
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 62,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 62,
  },
  backText: {
    marginLeft: 4,
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary2,
    letterSpacing: -0.3,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    shadowColor: '#64748B',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  titleLine1: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  formFields: {
    gap: spacing.xs,
  },
  field: {
    marginBottom: spacing.sm,
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
    borderColor: '#F5F7FA',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#121826',
    paddingVertical: 0,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mobileInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: radius.md + 4,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: '#F5F7FA',
  },
  verifyMobileButton: {
    height: 50,
    borderRadius: radius.md + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 50,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md + 4,
  },
  verifiedText: {
    fontWeight: '700',
  },
  otpSection: {
    gap: spacing.xs,
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.xs,
  },
  otpHint: {
    color: '#64748B',
    fontSize: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  otpBox: {
    width: 40,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#121826',
  },
  otpBoxFilled: {
    borderColor: colors.primary2,
    backgroundColor: '#FFFFFF',
  },
  otpErrorText: {
    fontSize: 12,
  },
  submitErrorText: {
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  otpBtnRow: {
    alignItems: 'flex-start',
    marginTop: spacing.xs,
  },
  otpVerifyButton: {
    height: 42,
    borderRadius: radius.round,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary2,
  },
  completeButton: {
    height: 50,
    borderRadius: radius.round,
    backgroundColor: colors.primary2,
    shadowColor: colors.primary2,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: spacing.lg,
  },
  completeButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
});