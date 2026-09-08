import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppText} from '../../../components/common/AppText';
import {AuthFormField} from './AuthFormField';
import {SocialLoginButtons} from './SocialLoginButtons';
import {signupSchema} from '../authValidation';
import {useMockSignup} from '../hooks/useMockSignup';
import {colors, radius, spacing} from '../../../theme';

export function SignupForm({onSwitchToLogin}) {
  const {signup, isSubmitting, errorMessage} = useMockSignup();
  const [agreeTerms, setAgreeTerms] = useState(true);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {username: '', email: '', mobile: '', password: ''},
  });

  const onSubmit = data => {
    if (!agreeTerms) {
      Alert.alert('Terms of Service', 'Please agree to the Terms of Service to continue.');
      return;
    }
    const payload = {
      ...data,
      confirmPassword: data.confirmPassword || data.password,
    };
    signup(payload);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <AppText variant="heading" style={styles.title}>
          Create an Account?
        </AppText>
      </View>

      {/* Input Fields */}
      <View style={styles.formFields}>
        <AuthFormField
          control={control}
          name="username"
          label="Name"
          placeholder="Johan orindo"
          error={errors.username?.message}
        />
        <AuthFormField
          control={control}
          name="email"
          label="Email"
          placeholder="joedoe75@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email?.message}
        />
        <AuthFormField
          control={control}
          name="mobile"
          label="Mobile Number"
          placeholder="9876766565"
          keyboardType="number-pad"
          maxLength={10}
          error={errors.mobile?.message}
        />
        <AuthFormField
          control={control}
          name="password"
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          error={errors.password?.message}
        />
      </View>

      {/* Terms of Service Checkbox */}
      <View style={styles.termsRow}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreeTerms(!agreeTerms)}
          activeOpacity={0.7}>
          <Icon
            name={agreeTerms ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={18}
            color={agreeTerms ? colors.primary2 : '#94A3B8'}
          />
          <AppText variant="caption" style={styles.termsText}>
            I agree to the{' '}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert('Terms of Service', 'Standard Terms of Service for TransportApp.')}
          activeOpacity={0.7}>
          <AppText variant="caption" style={styles.termsLink}>
            Terms of Service
          </AppText>
        </TouchableOpacity>
      </View>

      {errorMessage ? (
        <AppText variant="label" style={styles.error}>
          {errorMessage}
        </AppText>
      ) : null}

      {/* Primary Create Account Button */}
      <AppButton
        title={isSubmitting ? 'Creating account...' : 'Create account'}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={styles.signupBtn}
      />

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Bottom Switch Link */}
      {onSwitchToLogin ? (
        <View style={styles.switchRow}>
          <AppText variant="caption" color="textMuted">
            Already have an account?{' '}
          </AppText>
          <TouchableOpacity onPress={onSwitchToLogin} activeOpacity={0.7}>
            <AppText variant="caption" style={styles.switchLink}>
              Login
            </AppText>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  formFields: {
    gap: 2,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsText: {
    color: '#64748B',
    fontSize: 12,
  },
  termsLink: {
    color: colors.primary2,
    fontSize: 12,
    fontWeight: '600',
  },
  signupBtn: {
    height: 50,
    borderRadius: radius.round,
    backgroundColor: colors.primary2,
    shadowColor: colors.primary2,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  switchLink: {
    color: colors.primary2,
    fontWeight: '700',
  },
});