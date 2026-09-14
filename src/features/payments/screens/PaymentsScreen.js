import React, {useMemo, useState} from 'react';
import {
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

const paymentModes = ['Cash', 'UPI', 'Bank transfer', 'Cheque'];
const paymentTypes = [
  {key: 'received', label: 'Received', icon: 'arrow-down-left'},
  {key: 'paid', label: 'Paid', icon: 'arrow-up-right'},
];

const initialPayments = [
  {
    id: 'payment-1',
    account: 'ABC Transport',
    accountType: 'Party',
    amount: 5000,
    type: 'received',
    mode: 'UPI',
    date: '09 Sep 2026',
    reference: 'TRP-1024',
    note: 'Part payment against freight',
  },
  {
    id: 'payment-2',
    account: 'Sharma Suppliers',
    accountType: 'Supplier',
    amount: 12500,
    type: 'paid',
    mode: 'Bank transfer',
    date: '07 Sep 2026',
    reference: 'Diesel and toll',
    note: '',
  },
  {
    id: 'payment-3',
    account: 'Ramesh Kumar',
    accountType: 'Driver',
    amount: 8000,
    type: 'paid',
    mode: 'Cash',
    date: '06 Sep 2026',
    reference: 'TRP-1025',
    note: 'Trip advance',
  },
];

function todayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmount(amount) {
  return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState('received');
  const [accountType, setAccountType] = useState('Party');
  const [account, setAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const summary = useMemo(() => payments.reduce(
    (result, payment) => {
      if (payment.type === 'received') result.received += payment.amount;
      else result.paid += payment.amount;
      return result;
    },
    {received: 0, paid: 0},
  ), [payments]);

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter(payment => {
      const matchesFilter = activeFilter === 'all' || payment.type === activeFilter;
      const matchesSearch = !query || [payment.account, payment.reference, payment.mode]
        .some(value => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, payments, search]);

  const resetForm = () => {
    setType('received');
    setAccountType('Party');
    setAccount('');
    setAmount('');
    setMode('Cash');
    setReference('');
    setNote('');
  };

  const closeForm = () => {
    setModalVisible(false);
    resetForm();
  };

  const savePayment = () => {
    const numericAmount = Number(amount.replace(/,/g, ''));
    if (!account.trim() || !numericAmount || numericAmount < 0) return;

    setPayments(previous => [{
      id: `payment-${Date.now()}`,
      account: account.trim(),
      accountType,
      amount: numericAmount,
      type,
      mode,
      date: todayLabel(),
      reference: reference.trim() || 'No reference',
      note: note.trim(),
    }, ...previous]);
    closeForm();
  };

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <AppText variant="title">Payments</AppText>
            <AppText variant="body" color="textMuted">Track money received and paid</AppText>
          </View>
          <TouchableOpacity
            accessibilityLabel="Add payment"
            style={styles.headerAction}
            onPress={() => setModalVisible(true)}>
            <Icon name="plus" size={23} color={colors.onInk} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard label="Received" amount={summary.received} icon="arrow-down-left" tone="success" />
          <SummaryCard label="Paid" amount={summary.paid} icon="arrow-up-right" tone="danger" />
        </View>
        <View style={styles.netCard}>
          <View>
            <AppText variant="caption" color="textMuted">Net cash movement</AppText>
            <AppText variant="heading" style={summary.received - summary.paid >= 0 ? styles.receiveText : styles.payText}>
              {formatAmount(summary.received - summary.paid)}
            </AppText>
          </View>
          <Icon name="swap-vertical" size={28} color={colors.primary} />
        </View>

        <View style={styles.searchBox}>
          <Icon name="magnify" size={21} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search account or reference"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search ? <Pressable onPress={() => setSearch('')}><Icon name="close-circle" size={19} color={colors.textMuted} /></Pressable> : null}
        </View>

        <View style={styles.filterRow}>
          {['all', 'received', 'paid'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
              onPress={() => setActiveFilter(filter)}>
              <AppText variant="label" style={activeFilter === filter ? styles.activeFilterText : styles.filterText}>
                {filter === 'all' ? 'All payments' : filter === 'received' ? 'Received' : 'Paid'}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="heading">Payment history</AppText>
          <AppText variant="caption" color="textMuted">{visiblePayments.length} records</AppText>
        </View>

        {visiblePayments.length ? visiblePayments.map(payment => (
          <PaymentRow key={payment.id} payment={payment} />
        )) : (
          <View style={styles.emptyState}>
            <Icon name="cash-remove" size={34} color={colors.textMuted} />
            <AppText variant="body" color="textMuted">No payments match your search.</AppText>
          </View>
        )}

        <AppButton title="Add payment" onPress={() => setModalVisible(true)} style={styles.addButton} />
      </ScrollView>

      <PaymentModal
        visible={modalVisible}
        type={type}
        setType={setType}
        accountType={accountType}
        setAccountType={setAccountType}
        account={account}
        setAccount={setAccount}
        amount={amount}
        setAmount={setAmount}
        mode={mode}
        setMode={setMode}
        reference={reference}
        setReference={setReference}
        note={note}
        setNote={setNote}
        onClose={closeForm}
        onSave={savePayment}
      />
    </AppScreen>
  );
}

function SummaryCard({label, amount, icon, tone}) {
  const positive = tone === 'success';
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, positive ? styles.successIcon : styles.dangerIcon]}>
        <Icon name={icon} size={19} color={positive ? colors.success : colors.danger} />
      </View>
      <AppText variant="caption" color="textMuted">{label}</AppText>
      <AppText variant="heading" style={positive ? styles.receiveText : styles.payText}>{formatAmount(amount)}</AppText>
    </View>
  );
}

function PaymentRow({payment}) {
  const received = payment.type === 'received';
  return (
    <View style={styles.paymentRow}>
      <View style={[styles.paymentIcon, received ? styles.successIcon : styles.dangerIcon]}>
        <Icon name={received ? 'arrow-down-left' : 'arrow-up-right'} size={19} color={received ? colors.success : colors.danger} />
      </View>
      <View style={styles.paymentInfo}>
        <AppText variant="label">{payment.account}</AppText>
        <AppText variant="caption" color="textMuted">
          {payment.accountType}  •  {payment.date}  •  {payment.mode}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>{payment.reference}</AppText>
      </View>
      <AppText variant="label" style={received ? styles.receiveText : styles.payText}>
        {received ? '+' : '-'}{formatAmount(payment.amount)}
      </AppText>
    </View>
  );
}

function PaymentModal(props) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalKeyboard}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">Add payment</AppText>
              <Pressable onPress={props.onClose} accessibilityLabel="Close">
                <Icon name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <AppText variant="label" color="textMuted">Payment type</AppText>
              <View style={styles.choiceRow}>
                {paymentTypes.map(item => (
                  <TouchableOpacity key={item.key} onPress={() => props.setType(item.key)} style={[styles.choice, props.type === item.key && styles.selectedChoice]}>
                    <Icon name={item.icon} size={18} color={props.type === item.key ? colors.primary : colors.textMuted} />
                    <AppText variant="label" style={props.type === item.key ? styles.selectedChoiceText : null}>{item.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppText variant="label" color="textMuted">Account type</AppText>
              <View style={styles.choiceRow}>
                {['Party', 'Supplier', 'Driver'].map(item => (
                  <TouchableOpacity key={item} onPress={() => props.setAccountType(item)} style={[styles.smallChoice, props.accountType === item && styles.selectedChoice]}>
                    <AppText variant="label" style={props.accountType === item ? styles.selectedChoiceText : null}>{item}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <Field label="Account name" value={props.account} onChangeText={props.setAccount} placeholder="e.g. ABC Transport" />
              <Field label="Amount" value={props.amount} onChangeText={props.setAmount} placeholder="₹ 0" keyboardType="numeric" />
              <AppText variant="label" color="textMuted">Payment mode</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>
                {paymentModes.map(item => (
                  <TouchableOpacity key={item} onPress={() => props.setMode(item)} style={[styles.modeChoice, props.mode === item && styles.selectedMode]}>
                    <AppText variant="caption" style={props.mode === item ? styles.selectedChoiceText : null}>{item}</AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Field label="Trip / bill reference" value={props.reference} onChangeText={props.setReference} placeholder="Optional" />
              <Field label="Note" value={props.note} onChangeText={props.setNote} placeholder="Optional note" multiline />
              <AppButton title="Save payment" onPress={props.onSave} style={styles.saveButton} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function Field({label, multiline, ...inputProps}) {
  return (
    <View style={styles.field}>
      <AppText variant="label" color="textMuted">{label}</AppText>
      <TextInput {...inputProps} multiline={multiline} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.multilineInput]} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: spacing.xl},
  headerRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg},
  headerAction: {width: 42, height: 42, borderRadius: radius.round, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
  summaryGrid: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm},
  summaryCard: {flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, gap: 5},
  summaryIcon: {width: 32, height: 32, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center', marginBottom: 2},
  successIcon: {backgroundColor: colors.successSoft},
  dangerIcon: {backgroundColor: colors.dangerSoft},
  receiveText: {color: colors.success},
  payText: {color: colors.danger},
  netCard: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg},
  searchBox: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, paddingHorizontal: spacing.md, marginBottom: spacing.sm},
  searchInput: {flex: 1, color: colors.text, paddingVertical: spacing.sm},
  filterRow: {flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg},
  filterChip: {borderWidth: 1, borderColor: colors.border, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  activeFilterChip: {backgroundColor: colors.primary, borderColor: colors.primary},
  filterText: {color: colors.textMuted},
  activeFilterText: {color: colors.onInk},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm},
  paymentRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.md},
  paymentIcon: {width: 36, height: 36, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center'},
  paymentInfo: {flex: 1, gap: 2},
  emptyState: {alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl},
  addButton: {marginTop: spacing.lg},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  modalKeyboard: {maxHeight: '92%'},
  modalSheet: {backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg},
  modalHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg},
  choiceRow: {flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md},
  choice: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm},
  smallChoice: {flex: 1, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingVertical: spacing.sm},
  selectedChoice: {borderColor: colors.primary, backgroundColor: colors.primarySoft},
  selectedChoiceText: {color: colors.primary, fontWeight: '700'},
  field: {gap: 5, marginBottom: spacing.md},
  input: {borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  multilineInput: {minHeight: 72, textAlignVertical: 'top'},
  modeRow: {gap: spacing.sm, paddingVertical: spacing.sm, marginBottom: spacing.sm},
  modeChoice: {borderWidth: 1, borderColor: colors.border, borderRadius: radius.round, paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  selectedMode: {borderColor: colors.primary, backgroundColor: colors.primarySoft},
  saveButton: {marginTop: spacing.sm, marginBottom: spacing.md},
});
