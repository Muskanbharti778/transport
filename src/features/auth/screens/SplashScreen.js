import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {routes} from '../../../navigation/routeNames';
import {colors, spacing} from '../../../theme';

export default function SplashScreen({navigation}) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.replace(routes.welcome);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [navigation]);

  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <AppText variant="title" style={styles.title}>
        TransportApp
      </AppText>
      <AppText variant="body" color="textMuted">
        Manage every trip in one place.
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.primary2,
  },
});
