import React from 'react';
import {StyleSheet} from 'react-native';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {routes} from '../../../navigation/routeNames';
import {colors, spacing} from '../../../theme';

export default function WelcomeScreen({navigation}) {
  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <AppText variant="title" style={styles.title}>
        Welcome to TransportApp
      </AppText>
      <AppText variant="body" color="textMuted" style={styles.subtitle}>
        Keep your business, trips, and payments organized.
      </AppText>
      <AppButton title="Get started" onPress={() => navigation.navigate(routes.authForm)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.primary2,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
});
