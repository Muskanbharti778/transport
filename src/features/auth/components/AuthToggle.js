import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '../../../components/common/AppText';
import {radius} from '../../../theme';

export function AuthToggle({mode, onChange}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(mode === 'signup' ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(mode === 'signup' ? 1 : 0, {
      damping: 20,
      stiffness: 220,
    });
  }, [mode, progress]);

  const indicatorStyle = useAnimatedStyle(() => {
    if (trackWidth === 0) return {};
    const tabWidth = (trackWidth - 6) / 2;
    return {
      width: tabWidth,
      transform: [{translateX: progress.value * tabWidth}],
    };
  });

  return (
    <View
      style={styles.track}
      onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}>
      {trackWidth > 0 ? (
        <Animated.View style={[styles.indicator, indicatorStyle]} />
      ) : null}
      <TouchableOpacity
        style={styles.option}
        onPress={() => onChange('login')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Login tab">
        <AppText
          variant="label"
          style={mode === 'login' ? styles.activeLabel : styles.inactiveLabel}>
          Login
        </AppText>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.option}
        onPress={() => onChange('signup')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sign up tab">
        <AppText
          variant="label"
          style={mode === 'signup' ? styles.activeLabel : styles.inactiveLabel}>
          Sign up
        </AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: '#303033',
    borderRadius: radius.round,
    padding: 3,
    height: 46,
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    backgroundColor: '#E0E0E6',
    borderRadius: radius.round,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  option: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeLabel: {
    color: '#18181A',
    fontWeight: '700',
    fontSize: 14,
  },
  inactiveLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '500',
    fontSize: 14,
  },
});