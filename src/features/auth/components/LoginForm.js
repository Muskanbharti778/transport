import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppText} from '../../../components/common/AppText';
import {AuthFormField} from './AuthFormField';
import {SocialLoginButtons} from './SocialLoginButtons';
import {loginSchema} from '../authValidation';
import {useMockLogin} from '../hooks/useMockLogin';
import {colors, radius, spacing} from '../../../theme';

export function LoginForm({onSwitchToSignup}) {
  const {login, isSubmitting, errorMessage} = useMockLogin();
  const [rememberMe, setRememberMe] = useState(true);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {emailOrMobile: '', password: ''},
  });

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <AppText variant="heading" style={styles.titleLine1}>
          Welcome to
        </AppText>
        <AppText variant="heading" style={styles.titleLine2}>
          TransportApp login now!
        </AppText>
      </View>

      {/* Input Fields */}
      <View style={styles.formFields}>
        <AuthFormField
          control={control}
          name="emailOrMobile"
          label="Email or Mobile"
          placeholder="Email or mobile number"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.emailOrMobile?.message}
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

      {/* Remember me & Forgot Password */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={styles.rememberMeRow}
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}>
          <Icon
            name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={18}
            color={rememberMe ? colors.primary2 : '#94A3B8'}
          />
          <AppText variant="caption" style={styles.rememberMeText}>
            Remember me
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Alert.alert('Reset Password', 'Password reset instructions will be sent to your email.')
          }
          activeOpacity={0.7}>
          <AppText variant="caption" style={styles.forgotPasswordText}>
            Forget password?
          </AppText>
        </TouchableOpacity>
      </View>

      {errorMessage ? (
        <AppText variant="label" style={styles.error}>
          {errorMessage}
        </AppText>
      ) : null}

      {/* Primary Login Button */}
      <AppButton
        title={isSubmitting ? 'Logging in...' : 'Login'}
        onPress={handleSubmit(login)}
        disabled={isSubmitting}
        style={styles.loginBtn}
      />

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Bottom Switch Link */}
      {onSwitchToSignup ? (
        <View style={styles.switchRow}>
          <AppText variant="caption" color="textMuted">
            Don't have an account?{' '}
          </AppText>
          <TouchableOpacity onPress={onSwitchToSignup} activeOpacity={0.7}>
            <AppText variant="caption" style={styles.switchLink}>
              Sign up
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
  titleLine1: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  titleLine2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 2,
  },
  formFields: {
    gap: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: 2,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rememberMeText: {
    color: '#64748B',
    fontSize: 12,
  },
  forgotPasswordText: {
    color: colors.primary2,
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
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