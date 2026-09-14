import React, {useState, useMemo} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
 // availableExpenseTypes,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {DatePickerModal} from '../../../components/common/DatePickerModal';
import {colors, radius, spacing} from '../../../theme';
import {useNavigation} from '@react-navigation/native';
import {routes} from '../../../navigation/routeNames';
//import {colors, spacing} from '../../theme';


const expenseOptions = [
   {
    key: 'truck',
    label: 'Truck Expense',
    icon: 'truck-outline',
   },
   {
    key: 'trip',
    label: 'Trip Expense',
    icon: 'map-marker-path',
   },
   {
    key: 'office',
    label: 'Office Expense',
    icon: 'office-building-outline',
   },
];


const paymentMethods = ['Cash', 'Credit', 'Online'];

const expenseTypes = {
  truck: [
    'Fuel',
    'Maintenance',
    'Repair',
    'Tyre',
    'Insurance',
    'Permit',
    'Service',
    'Parking',
    'Other',
  ],
  trip: [
    'Toll',
    'Loading',
    'Unloading',
    'Food',
    'Driver Advance',
    'Parking',
    'Detention',
    'Miscellaneous',
    'Other',
  ],
  office: [
    'Office Rent',
    'Electricity',
    'Internet',
    'Telephone',
    'Salary',
    'Stationery',
    'Software',
    'Tea and Snacks',
    'Other',
  ],
};


export default function ExpensesScreen() {
  const [activeExpense, setActiveExpense] = useState('truck');
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [expenseTypeModalVisible, setExpenseTypeModalVisible] = useState(false);

  const [expenseType, setExpenseType] = useState('');
  const [vehicleOrTripNumber, setVehicleOrTripNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [expenseDate, setExpenseDate] = useState('');
  const [note, setNote] = useState('');
  const navigation = useNavigation();
  const [expenses, setExpenses] = useState([]);

  const selectedExpense = expenseOptions.find(
    option => option.key === activeExpense,
  );

  const isTruckExpense = activeExpense === 'truck';
  const isTripExpense = activeExpense === 'trip';

  const referenceLabel = isTruckExpense ? 'Truck Number' : 'Trip Number';
  const referencePlaceholder = isTruckExpense
    ? 'Enter truck number'
    : 'Enter trip number';

  // const resetForm = () => {
  //   setExpenseType('');
  //   setVehicleOrTripNumber('');
  //   setAmount('');
  //   setPaymentMethod('Cash');
  //   setExpenseDate('');
  //   setNote('');
  // };

  const resetForm = () => {
  setExpenseType('');
  setVehicleOrTripNumber('');
  setAmount('');
  setPaymentMethod('Cash');
  setExpenseDate('');
  setNote('');
  setExpenseTypeModalVisible(false);
};

  const openExpenseForm = () => {
    resetForm();
    setExpenseModalVisible(true);
  };

  const closeExpenseForm = () => {
    setExpenseModalVisible(false);
    setDatePickerVisible(false);
  };


  const handleConfirm = () => {
  const newExpense = {
    id: Date.now(),
    category: activeExpense,
    expenseType,
    referenceNumber: vehicleOrTripNumber,
    amount: Number(amount),
    paymentMethod,
    expenseDate,
    note,
  };

  setExpenses(previousExpenses => [...previousExpenses, newExpense]);

  closeExpenseForm();
  resetForm();
};
   
  const isFormValid =
    expenseType.trim() &&
    amount.trim() &&
    expenseDate &&
    (isTruckExpense || isTripExpense
      ? vehicleOrTripNumber.trim()
      : true);

  const availableExpenseTypes = expenseTypes[activeExpense] || [];
  
      const monthlySpend = useMemo(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  return expenses
    .filter(expense => {
      const expenseDateValue = new Date(expense.expenseDate);

      return (
        expenseDateValue.getMonth() === currentMonth &&
        expenseDateValue.getFullYear() === currentYear
      );
    })
    .reduce((total, expense) => total + expense.amount, 0);
}, [expenses]);


const handleViewReport = () => {
  navigation.navigate(routes.profitLossReport, {
  expenses,
});
};

    return (
        <AppScreen>
           
<View style={styles.monthlySummary}>
  <View>
    <AppText variant="caption" color="textMuted">
      Monthly Spend
    </AppText>

    <AppText variant="title" style={styles.monthlyAmount}>
      ₹{monthlySpend.toLocaleString('en-IN')}
    </AppText>
  </View>

  <TouchableOpacity
    style={styles.reportButton}
    onPress={handleViewReport}
    activeOpacity={0.8}>
    <Icon name="chart-line" size={18} color={colors.onInk} />
    <AppText variant="label" style={styles.reportButtonText}>
      View Report
    </AppText>
  </TouchableOpacity>
</View>

<AppText variant="heading" style={styles.title}>  
                Expenses
            </AppText>

            <View style={styles.optionsRow}>
                {expenseOptions.map(option => {
                    const isActive = activeExpense === option.key;

                    return (
                        <TouchableOpacity 
                        key={option.key}
                        style={[styles.option, isActive && styles.activeOption]}
                        onPress={() => setActiveExpense(option.key)}
                        activeOpacity={0.8}>
                            <Icon
                            name={option.icon}
                            size={22}
                            color={isActive ? colors.onInk : colors.primary}
                            />

                            <AppText
                            variant="caption"
                            style={[styles.optionText, isActive && styles.activeText]}>
                                {option.label}
                            </AppText>
                        </TouchableOpacity> 
                    );
                })}
            </View>

            <View style={styles.content}>
        <Icon
          name={selectedExpense.icon}
          size={44}
          color={colors.primary}
        />

        <AppText variant="heading">{selectedExpense.label}</AppText>

        <AppText variant="body" color="textMuted">
          Add and manage your {selectedExpense.label.toLowerCase()} records.
        </AppText>

        <AppButton
          title={`Add ${selectedExpense.label}`}
          onPress={openExpenseForm}
          style={styles.addButton}
        />
      </View>

       <Modal
        visible={expenseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeExpenseForm}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <AppText variant="heading">
                  Add {selectedExpense.label}
                </AppText>

                <TouchableOpacity
                  onPress={closeExpenseForm}
                  accessibilityLabel="Close">
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={styles.form}>

                  <AppText variant="caption" color="textMuted">
                    Expense Type
                  </AppText>

                  <TouchableOpacity
                 style={styles.expenseTypeSelect}
                 onPress={() => setExpenseTypeModalVisible(true)}
                 activeOpacity={0.8}>
                  <AppText color={expenseType ? 'text' : 'textMuted'}>
                  {expenseType || 'Select expense type'}
                  </AppText>

                  <Icon
                 name="chevron-down"
                 size={22}
                  color={colors.primary}
                  />
                 </TouchableOpacity>
                  {/* <AppText variant="caption" color="textMuted">
                    Expense Type
                  </AppText> */}
                 
                  {/* <TextInput
                    value={expenseType}
                    onChangeText={setExpenseType}
                    placeholder="Enter expense type"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  /> */}

                  {/* <View style={styles.expenseTypesGrid}>
                    {availableExpenseTypes.map(type => {
                    const isSelected = expenseType === type;

                  return (
                   <TouchableOpacity
                     key={type}
                      style={[
                      styles.expenseTypeOption,
                      isSelected && styles.selectedExpenseType,
                       ]}
                       onPress={() => setExpenseType(type)}
                        activeOpacity={0.8}>
                        <AppText
                        variant="label"
                        style={[
                        styles.expenseTypeText,
                        isSelected && styles.selectedExpenseTypeText,
                        ]}>
                        {type}
                        </AppText>
                        </TouchableOpacity>
                        );
                      })}
                    </View>
                     */}

                     {/* <View style={styles.expenseTypesGrid}>
  {availableExpenseTypes.map(type => {
    const isSelected = expenseType === type;

    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.expenseTypeOption,
          isSelected && styles.selectedExpenseType,
        ]}
        onPress={() => setExpenseType(type)}
        activeOpacity={0.8}>
        <AppText
          variant="label"
          style={[
            styles.expenseTypeText,
            isSelected && styles.selectedExpenseTypeText,
          ]}>
          {type}
        </AppText>
      </TouchableOpacity>
    );
  })}
</View> */}

                  {isTruckExpense || isTripExpense ? (
                    <>
                      <AppText variant="caption" color="textMuted">
                        {referenceLabel}
                      </AppText>

                      <TextInput
                        value={vehicleOrTripNumber}
                        onChangeText={setVehicleOrTripNumber}
                        placeholder={referencePlaceholder}
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        autoCapitalize="characters"
                      />
                    </>
                  ) : null}

                  <AppText variant="caption" color="textMuted">
                    Expense Amount
                  </AppText>

                  <View style={styles.amountInput}>
                    <AppText variant="body">₹</AppText>

                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Enter expense amount"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      style={styles.amountTextInput}
                    />
                  </View>

                  <AppText variant="caption" color="textMuted">
                    Payment Method
                  </AppText>

                  <View style={styles.paymentRow}>
                    {paymentMethods.map(method => {
                      const isSelected = paymentMethod === method;

                      return (
                        <TouchableOpacity
                          key={method}
                          style={[
                            styles.paymentOption,
                            isSelected && styles.selectedPayment,
                          ]}
                          onPress={() => setPaymentMethod(method)}
                          activeOpacity={0.8}>
                          <AppText
                            variant="label"
                            style={
                              isSelected && styles.selectedPaymentText
                            }>
                            {method}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <AppText variant="caption" color="textMuted">
                    Expense Date
                  </AppText>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setDatePickerVisible(true)}
                    activeOpacity={0.8}>
                    <AppText color={expenseDate ? 'text' : 'textMuted'}>
                       {expenseDate || 'Select expense date'}
                    </AppText>

                    <Icon
                      name="calendar-month-outline"
                      size={22}
                      color={colors.primary}
                    />
                  </TouchableOpacity>

                  <AppText variant="caption" color="textMuted">
                    Note
                  </AppText>

                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Enter note"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.noteInput]}
                    multiline
                    textAlignVertical="top"
                  />

                  <AppButton
                    title="Confirm"
                    onPress={handleConfirm}
                    disabled={!isFormValid}
                    style={styles.confirmButton}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>


      <Modal
  visible={expenseTypeModalVisible}
  animationType="fade"
  transparent
  onRequestClose={() => setExpenseTypeModalVisible(false)}>
  <View style={styles.expenseTypeOverlay}>
    <View style={styles.expenseTypeModal}>
      
      <View style={styles.modalHeader}>
        <AppText variant="heading">
          Select Expense Type
        </AppText>

        <TouchableOpacity
          onPress={() => setExpenseTypeModalVisible(false)}
          accessibilityLabel="Close">
          <Icon
            name="close"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.expenseTypeList}>
        {availableExpenseTypes.map(type => {
          const isSelected = expenseType === type;

          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.expenseTypeItem,
                isSelected && styles.selectedExpenseTypeItem,
              ]}
              onPress={() => {
                setExpenseType(type);
                setExpenseTypeModalVisible(false);
              }}
              activeOpacity={0.8}>
              
              <AppText
                variant="body"
                style={
                  isSelected
                    ? styles.selectedExpenseTypeItemText
                    : styles.expenseTypeItemText
                }>
                {type}
              </AppText>

              {isSelected && (
                <Icon
                  name="check"
                  size={22}
                  color={colors.onInk}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  </View>
</Modal>

      <DatePickerModal
        visible={datePickerVisible}
        initialDate={expenseDate}
        title="Select Expense Date"
        onSelectDate={date => {
          setExpenseDate(date);
          setDatePickerVisible(false);
        }}
        onClose={() => setDatePickerVisible(false)}
      />
    </AppScreen>
  );
}


const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
    color: colors.primary2,
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
  marginBottom: spacing.md,
},

monthlySummary: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: spacing.md,
  marginBottom: spacing.lg,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
},

monthlyAmount: {
  marginTop: spacing.xs,
  color: colors.primary2,
},

reportButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.xs,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderRadius: radius.md,
  backgroundColor: colors.primary,
},

reportButtonText: {
  color: colors.onInk,
},
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  option: {
    flex: 1,
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  activeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    textAlign: 'center',
    color: colors.text,
  },
  activeText: {
    color: colors.onInk,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
  },
  addButton: {
    marginTop: spacing.md,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  keyboardView: {
    width: '100%',
  },
    modal: {
    maxHeight: '92%',
    padding: spacing.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  amountInput: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  amountTextInput: {
    flex: 1,
    color: colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  paymentOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  selectedPayment: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  selectedPaymentText: {
    color: colors.onInk,
  },
  dateButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  noteInput: {
    minHeight: 84,
  },
  confirmButton: {
    marginTop: spacing.md,
  },

  expenseTypesGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.sm,
  marginBottom: spacing.sm,
},

expenseTypeOption: {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
},

selectedExpenseType: {
  borderColor: colors.primary,
  backgroundColor: colors.primary,
},

expenseTypeText: {
  color: colors.text,
},

selectedExpenseTypeText: {
  color: colors.onInk,
},

expenseTypeSelect: {
  minHeight: 48,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
},

expenseTypeOverlay: {
  flex: 1,
  justifyContent: 'center',
  padding: spacing.lg,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
},

expenseTypeModal: {
  maxHeight: '75%',
  padding: spacing.xl,
  borderRadius: radius.lg,
  backgroundColor: colors.background,
},

expenseTypeList: {
  gap: spacing.sm,
  paddingBottom: spacing.sm,
},

expenseTypeItem: {
  minHeight: 50,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radius.md,
  backgroundColor: colors.surface,
},

expenseTypeItemText: {
  color: colors.text,
},

selectedExpenseTypeItem: {
  borderColor: colors.primary,
  backgroundColor: colors.primary,
},

selectedExpenseTypeItemText: {
  color: colors.onInk,
},
});
