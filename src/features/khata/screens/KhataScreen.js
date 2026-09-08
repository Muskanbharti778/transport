import React from 'react';
import {EmptyState} from '../../../components/common/EmptyState';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';

export default function KhataScreen() {
  return (
    <AppScreen>
      <AppHeader
        title="Khata"
        subtitle="Ledger, balances and accounting workflows will remain backend-authoritative."
      />
      <EmptyState
        title="No ledger data"
        message="Party and supplier balances will appear after the accounting API is defined."
      />
    </AppScreen>
  );
}
