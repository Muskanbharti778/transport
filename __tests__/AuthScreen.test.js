import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {NavigationContainer} from '@react-navigation/native';
import AuthScreen from '../src/features/auth/screens/AuthScreen';

describe('AuthScreen redesign', () => {
  it('renders AuthScreen correctly', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <NavigationContainer>
          <AuthScreen />
        </NavigationContainer>,
      );
    });
    expect(tree).toBeDefined();
  });
});
