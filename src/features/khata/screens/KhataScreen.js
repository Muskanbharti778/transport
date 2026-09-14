import React, {useMemo, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const accountTabs = [
  {key: 'all', label: 'All'},
  {key: 'party', label: 'Parties'},
  {key: 'supplier', label: 'Suppliers'},
  {key: 'driver', label: 'Drivers'},
];

const initialAccounts = [
  {
    id: 'party-1', name: 'ABC Transport', type: 'party', phone: '9876543210', balance: 45000,
    transactions: [
      {id: 't-1', label: 'Freight for TRP-1024', amount: 50000, direction: 'credit', date: '08 Sep 2026', mode: 'Credit'},
      {id: 't-2', label: 'Payment received', amount: 5000, direction: 'debit', date: '09 Sep 2026', mode: 'UPI'},
    ],
  },
  {
    id: 'supplier-1', name: 'Sharma Suppliers', type: 'supplier', phone: '9811122233', balance: -12500,
    transactions: [{id: 't-3', label: 'Diesel and toll bill', amount: 12500, direction: 'debit', date: '07 Sep 2026', mode: 'Credit'}],
  },
  {
    id: 'driver-1', name: 'Ramesh Kumar', type: 'driver', phone: '9898989898', balance: -8000,
    transactions: [{id: 't-4', label: 'Trip advance TRP-1025', amount: 8000, direction: 'debit', date: '06 Sep 2026', mode: 'Cash'}],
  },
];

const transactionTypes = [
  {key: 'credit', label: 'Sale / bill', icon: 'arrow-down-left'},
  {key: 'debit', label: 'Payment given', icon: 'arrow-up-right'},
];
const paymentModes = ['Cash', 'UPI', 'Bank', 'Cheque', 'Credit'];

function formatAmount(amount) {
  return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
}

function accountTypeLabel(type) {
  return type === 'party' ? 'Party' : type === 'supplier' ? 'Supplier' : 'Driver';
}

export default function KhataScreen() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [transactionVisible, setTransactionVisible] = useState(false);
  const [detailAccount, setDetailAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('credit');
  const [accountType, setAccountType] = useState('party');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const totals = useMemo(() => accounts.reduce((result, account) => {
    if (account.balance >= 0) result.receivable += account.balance;
    else result.payable += Math.abs(account.balance);
    return result;
  }, {receivable: 0, payable: 0}), [accounts]);

  const visibleAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter(account => {
      const matchesTab = activeTab === 'all' || account.type === activeTab;
      const matchesSearch = !query || account.name.toLowerCase().includes(query) || account.phone.includes(query);
      return matchesTab && matchesSearch;
    });
  }, [accounts, activeTab, search]);

  const resetTransaction = () => {
    setTransactionType('credit'); setAccountType('party'); setAccountName(''); setAmount('');
    setPaymentMode('Cash'); setReference(''); setNote('');
  };

  const closeTransaction = () => { setTransactionVisible(false); resetTransaction(); };

  const addTransaction = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!accountName.trim() || !numericAmount || numericAmount < 0) {
      Alert.alert('Missing details', 'Enter an account name and a valid amount.');
      return;
    }
    const normalizedName = accountName.trim();
    const existingAccount = accounts.find(account => account.name.toLowerCase() === normalizedName.toLowerCase());
    const transaction = {
      id: `t-${Date.now()}`,
      label: reference.trim() || (transactionType === 'credit' ? 'New bill' : 'Payment'),
      amount: numericAmount, direction: transactionType, date: '09 Sep 2026', mode: paymentMode, note: note.trim(),
    };
    setAccounts(previous => {
      if (existingAccount) return previous.map(account => account.id === existingAccount.id ? {
        ...account,
        balance: account.balance + (transactionType === 'credit' ? numericAmount : -numericAmount),
        transactions: [transaction, ...account.transactions],
      } : account);
      return [{
        id: `account-${Date.now()}`, name: normalizedName, type: accountType, phone: '',
        balance: transactionType === 'credit' ? numericAmount : -numericAmount, transactions: [transaction],
      }, ...previous];
    });
    closeTransaction();
  };

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <View><AppText variant="title">Khata</AppText><AppText variant="body" color="textMuted">Your accounts at a glance</AppText></View>
        <TouchableOpacity accessibilityLabel="Add transaction" style={styles.headerAction} onPress={() => setTransactionVisible(true)}><Icon name="plus" size={22} color={colors.onInk} /></TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard label="To receive" amount={totals.receivable} color="success" icon="arrow-down-left" />
        <SummaryCard label="To pay" amount={totals.payable} color="danger" icon="arrow-up-right" />
      </View>
      <View style={styles.netBalance}><View><AppText variant="caption" color="textMuted">Net balance</AppText><AppText variant="heading">{formatAmount(totals.receivable - totals.payable)}</AppText></View><Icon name="scale-balance" size={30} color={colors.primary} /></View>

      <View style={styles.searchBox}><Icon name="magnify" size={21} color={colors.textMuted} /><TextInput value={search} onChangeText={setSearch} placeholder="Search account or phone" placeholderTextColor={colors.textMuted} style={styles.searchInput} />{search ? <Pressable onPress={() => setSearch('')}><Icon name="close-circle" size={19} color={colors.textMuted} /></Pressable> : null}</View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {accountTabs.map(tab => {
          const isSelected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.filterButton, isSelected && styles.activeFilter]}
              activeOpacity={0.8}>
              <AppText
                variant="label"
                style={isSelected ? styles.activeTabText : styles.tabText}>
                {tab.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.sectionHeading}><AppText variant="heading">Accounts</AppText><AppText variant="caption" color="textMuted">{visibleAccounts.length} accounts</AppText></View>
      {visibleAccounts.length ? visibleAccounts.map(account => <TouchableOpacity key={account.id} activeOpacity={0.8} onPress={() => setDetailAccount(account)} style={styles.accountRow}>
        <View style={styles.accountIcon}><AppText variant="heading" style={styles.accountInitial}>{account.name.charAt(0).toUpperCase()}</AppText></View>
        <View style={styles.accountInfo}><AppText variant="label">{account.name}</AppText><AppText variant="caption" color="textMuted">{accountTypeLabel(account.type)}{account.phone ? `  •  ${account.phone}` : ''}</AppText></View>
        <View style={styles.accountBalance}><AppText variant="label" style={account.balance >= 0 ? styles.receiveText : styles.payText}>{formatAmount(account.balance)}</AppText><AppText variant="caption" color="textMuted">{account.balance >= 0 ? 'To receive' : 'To pay'}</AppText></View><Icon name="chevron-right" size={21} color={colors.textMuted} />
      </TouchableOpacity>) : <View style={styles.emptyResult}><Icon name="book-search-outline" size={32} color={colors.textMuted} /><AppText variant="body" color="textMuted">No accounts match your filters.</AppText></View>}

      <AppButton title="Add transaction" onPress={() => setTransactionVisible(true)} style={styles.addButton} />
      <TransactionModal visible={transactionVisible} transactionType={transactionType} setTransactionType={setTransactionType} accountType={accountType} setAccountType={setAccountType} accountName={accountName} setAccountName={setAccountName} amount={amount} setAmount={setAmount} paymentMode={paymentMode} setPaymentMode={setPaymentMode} reference={reference} setReference={setReference} note={note} setNote={setNote} onClose={closeTransaction} onSave={addTransaction} />
      <AccountDetailModal account={detailAccount} onClose={() => setDetailAccount(null)} />
    </AppScreen>
  );
}

function SummaryCard({label, amount, color, icon}) {
  const textStyle = color === 'success' ? styles.receiveText : styles.payText;
  return <View style={styles.summaryCard}><View style={[styles.summaryIcon, color === 'success' ? styles.successIcon : styles.dangerIcon]}><Icon name={icon} size={19} color={color === 'success' ? colors.success : colors.danger} /></View><AppText variant="caption" color="textMuted">{label}</AppText><AppText variant="heading" style={textStyle}>{formatAmount(amount)}</AppText></View>;
}

function TransactionModal(props) {
  return <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}><View style={styles.modalOverlay}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}><View style={styles.modalSheet}>
    <View style={styles.modalHeader}><AppText variant="heading">Add transaction</AppText><Pressable onPress={props.onClose}><Icon name="close" size={24} color={colors.text} /></Pressable></View>
    <ScrollView keyboardShouldPersistTaps="handled">
      <AppText variant="label" color="textMuted">Transaction type</AppText><View style={styles.choiceRow}>{transactionTypes.map(type => <TouchableOpacity key={type.key} onPress={() => props.setTransactionType(type.key)} style={[styles.choice, props.transactionType === type.key && styles.selectedChoice]}><Icon name={type.icon} size={18} color={props.transactionType === type.key ? colors.primary : colors.textMuted} /><AppText variant="label" style={props.transactionType === type.key ? styles.selectedChoiceText : null}>{type.label}</AppText></TouchableOpacity>)}</View>
      <AppText variant="label" color="textMuted">Account type</AppText><View style={styles.choiceRow}>{['party', 'supplier', 'driver'].map(type => <TouchableOpacity key={type} onPress={() => props.setAccountType(type)} style={[styles.smallChoice, props.accountType === type && styles.selectedChoice]}><AppText variant="label" style={props.accountType === type ? styles.selectedChoiceText : null}>{accountTypeLabel(type)}</AppText></TouchableOpacity>)}</View>
      <Field label="Account name" value={props.accountName} onChangeText={props.setAccountName} placeholder="e.g. ABC Transport" /><Field label="Amount" value={props.amount} onChangeText={props.setAmount} placeholder="₹ 0" keyboardType="numeric" />
      <AppText variant="label" color="textMuted">Payment mode</AppText><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>{paymentModes.map(mode => <TouchableOpacity key={mode} onPress={() => props.setPaymentMode(mode)} style={[styles.modeChoice, props.paymentMode === mode && styles.selectedMode]}><AppText variant="caption" style={props.paymentMode === mode ? styles.selectedChoiceText : null}>{mode}</AppText></TouchableOpacity>)}</ScrollView>
      <Field label="Trip / bill reference" value={props.reference} onChangeText={props.setReference} placeholder="Optional" /><Field label="Note" value={props.note} onChangeText={props.setNote} placeholder="Optional note" multiline /><AppButton title="Save transaction" onPress={props.onSave} style={styles.saveButton} />
    </ScrollView>
  </View></KeyboardAvoidingView></View></Modal>;
}

function Field({label, multiline, ...inputProps}) {
  return <View style={styles.field}><AppText variant="label" color="textMuted">{label}</AppText><TextInput {...inputProps} multiline={multiline} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.multilineInput]} /></View>;
}

function AccountDetailModal({account, onClose}) {
  if (!account) return null;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalOverlay}><View style={styles.detailSheet}>
    <View style={styles.modalHeader}><View><AppText variant="heading">{account.name}</AppText><AppText variant="caption" color="textMuted">{accountTypeLabel(account.type)} account</AppText></View><Pressable onPress={onClose}><Icon name="close" size={24} color={colors.text} /></Pressable></View>
    <View style={styles.detailBalance}><AppText variant="caption" color="textMuted">Current balance</AppText><AppText variant="title" style={account.balance >= 0 ? styles.receiveText : styles.payText}>{formatAmount(account.balance)}</AppText><AppText variant="caption" color="textMuted">{account.balance >= 0 ? 'You will receive' : 'You will pay'}</AppText></View>
    <AppText variant="heading" style={styles.historyTitle}>Transaction history</AppText>{account.transactions.map(transaction => <View key={transaction.id} style={styles.transactionRow}><View style={styles.transactionIcon}><Icon name={transaction.direction === 'credit' ? 'arrow-down-left' : 'arrow-up-right'} size={18} color={transaction.direction === 'credit' ? colors.success : colors.danger} /></View><View style={styles.transactionInfo}><AppText variant="label">{transaction.label}</AppText><AppText variant="caption" color="textMuted">{transaction.date}  •  {transaction.mode}</AppText></View><AppText variant="label" style={transaction.direction === 'credit' ? styles.receiveText : styles.payText}>{transaction.direction === 'credit' ? '+' : '-'}{formatAmount(transaction.amount)}</AppText></View>)}
  </View></View></Modal>;
}

const styles = StyleSheet.create({
  headerRow:
   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl},
  headerAction:
   {backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  summaryGrid: 
  {flexDirection: 'row', gap: spacing.md}, summaryCard: {backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: spacing.md, flex: 1, gap: 3},
  summaryIcon: 
  {width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs}, successIcon: {backgroundColor: colors.successSoft}, dangerIcon: {backgroundColor: colors.dangerSoft}, receiveText: {color: colors.success}, payText: {color: colors.danger},
  netBalance: 
  {backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, searchBox: {backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.md, minHeight: 48, marginTop: spacing.xl, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center'}, searchInput: {flex: 1, color: colors.text, fontSize: 15, paddingVertical: 10, marginLeft: spacing.sm},
  tabs:
   {gap: spacing.sm, paddingVertical: spacing.md}, tabText: {color: colors.textMuted}, activeTabText: {color: colors.onInk}, filterButton: {width: 82, height: 42, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'}, activeFilter: {backgroundColor: colors.primary, borderColor: colors.primary}, sectionHeading: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm},
  accountRow: 
  {backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm}, accountIcon: {width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm}, accountInitial: {color: colors.primary}, accountInfo: {flex: 1, gap: 2}, accountBalance: {alignItems: 'flex-end', marginRight: spacing.xs, gap: 2}, emptyResult: {alignItems: 'center', padding: spacing.xl, gap: spacing.sm}, addButton: {marginTop: spacing.md, marginBottom: spacing.lg},
  modalOverlay:
   {flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end'}, modalKeyboard: {maxHeight: '92%'}, modalSheet: {backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, maxHeight: '100%'}, modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg}, choiceRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md}, choice: {flex: 1, minHeight: 46, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5}, smallChoice: {flex: 1, minHeight: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'}, selectedChoice: {backgroundColor: colors.primarySoft, borderColor: colors.primary}, selectedChoiceText: {color: colors.primary}, field: {gap: 5, marginBottom: spacing.md}, input: {minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.text, fontSize: 15}, multilineInput: {minHeight: 76, textAlignVertical: 'top', paddingTop: spacing.sm}, modeRow: {gap: spacing.sm, paddingVertical: spacing.sm, marginBottom: spacing.sm}, modeChoice: {paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, backgroundColor: colors.surfaceMuted}, selectedMode: {backgroundColor: colors.primarySoft}, saveButton: {marginTop: spacing.sm, marginBottom: spacing.md},
  detailSheet: 
  {backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, minHeight: '62%'}, detailBalance: {backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.xl}, historyTitle: {marginBottom: spacing.sm}, transactionRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border}, transactionIcon: {width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm}, transactionInfo: {flex: 1, gap: 2},
});

