import React from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {radius, spacing} from '../../../theme';

export function SocialLoginButtons() {
  const handleSocialPress = provider => {
    Alert.alert('Social Sign In', `Sign in with ${provider} is not configured in this demo.`);
  };

  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.dividerText}>
        Or Sign in with
      </AppText>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialPress('Facebook')}
          activeOpacity={0.7}
          accessibilityLabel="Sign in with Facebook">
          <Icon name="facebook" size={24} color="#1877F2" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialPress('Google')}
          activeOpacity={0.7}
          accessibilityLabel="Sign in with Google">
          <Icon name="google" size={22} color="#EA4335" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => handleSocialPress('Apple')}
          activeOpacity={0.7}
          accessibilityLabel="Sign in with Apple">
          <Icon name="apple" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: spacing.md,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md + 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});
