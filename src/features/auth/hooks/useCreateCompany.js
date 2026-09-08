import {useState} from 'react';
import {authApi} from '../auth.api';

export function useCreateCompany() {
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const createCompany = async payload => {
    setIsCreating(true);
    setErrorMessage('');
    try {
      return await authApi.createCompany(payload);
    } catch (error) {
      setErrorMessage(error?.message || 'Unable to complete business setup.');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {createCompany, isCreating, errorMessage};
}
