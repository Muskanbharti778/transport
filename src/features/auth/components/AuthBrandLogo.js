import React from 'react';
import {StyleSheet, View} from 'react-native';

export function AuthBrandLogo() {
  return (
    <View style={styles.container}>
      {/* Top ribbon bar */}
      <View style={styles.topBar} />
      {/* Diagonal ribbon bar */}
      <View style={styles.diagonalBar} />
      {/* Bottom ribbon bar */}
      <View style={styles.bottomBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topBar: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 36,
    height: 14,
    backgroundColor: '#18181A',
    borderRadius: 7,
    transform: [{rotate: '-8deg'}],
  },
  diagonalBar: {
    position: 'absolute',
    width: 48,
    height: 14,
    backgroundColor: '#27272A',
    borderRadius: 7,
    transform: [{rotate: '-42deg'}],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 6,
    right: 8,
    width: 36,
    height: 14,
    backgroundColor: '#18181A',
    borderRadius: 7,
    transform: [{rotate: '-8deg'}],
  },
});
