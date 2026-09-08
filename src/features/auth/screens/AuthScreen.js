import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {LoginForm} from '../components/LoginForm';
import {SignupForm} from '../components/SignupForm';
import {colors, radius, spacing} from '../../../theme';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');

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
            {mode === 'signup' ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setMode('login')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Back to Login">
                <Icon name="chevron-left" size={24} color="#1E293B" />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}

            <AppText variant="title" style={styles.brandTitle}>
              TransportApp
            </AppText>

            <View style={styles.headerSpacer} />
          </View>

          {/* Main White Floating Card */}
          <View style={styles.mainCard}>
            {mode === 'login' ? (
              <LoginForm onSwitchToSignup={() => setMode('signup')} />
            ) : (
              <SignupForm onSwitchToLogin={() => setMode('login')} />
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.round,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSpacer: {
    width: 38,
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
});