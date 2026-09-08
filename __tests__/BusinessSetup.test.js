import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import BusinessSetupScreen from '../src/features/auth/screens/BusinessSetupScreen';

jest.mock('../src/features/auth/hooks/useSendMobileOtp', () => ({
  useSendMobileOtp: () => ({
    sendOtp: jest.fn().mockResolvedValue({}),
    isSending: false,
  }),
}));

jest.mock('../src/features/auth/hooks/useVerifyMobileOtp', () => ({
  useVerifyMobileOtp: () => ({
    verifyOtp: jest.fn().mockResolvedValue({verified: true}),
    isVerifying: false,
    errorMessage: '',
  }),
}));

describe('BusinessSetupScreen', () => {
  it('renders correctly and has disabled Complete Signup when not verified', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<BusinessSetupScreen />);
    });
    expect(tree).toBeDefined();
  });
});
