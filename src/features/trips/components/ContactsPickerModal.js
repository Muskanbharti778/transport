import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppText} from '../../../components/common/AppText';
import {colors, radius, spacing} from '../../../theme';

const MOCK_CONTACTS = [
  {id: 'c-1', name: 'Amitabh Sharma', phone: '9876543210', category: 'Contact'},
  {id: 'c-2', name: 'Bharat Logistics', phone: '9822011223', category: 'Party / Customer'},
  {id: 'c-3', name: 'Chandra Shekar', phone: '9741029384', category: 'Driver'},
  {id: 'c-4', name: 'Dharmesh Transport', phone: '9980112233', category: 'Party / Customer'},
  {id: 'c-5', name: 'Ganesh Drivers Agency', phone: '9845012345', category: 'Driver'},
  {id: 'c-6', name: 'Harish Freight Co.', phone: '9731234567', category: 'Party / Customer'},
  {id: 'c-7', name: 'Kishan Kumar', phone: '9440112233', category: 'Driver'},
  {id: 'c-8', name: 'Lalit Mittal', phone: '9911223344', category: 'Contact'},
  {id: 'c-9', name: 'Mukesh Ambani Logistics', phone: '9820011223', category: 'Party / Customer'},
  {id: 'c-10', name: 'Naveen Transport Services', phone: '9811224466', category: 'Party / Customer'},
  {id: 'c-11', name: 'Praveen Driver', phone: '9876123450', category: 'Driver'},
  {id: 'c-12', name: 'Rahul Express Freight', phone: '9900112233', category: 'Party / Customer'},
  {id: 'c-13', name: 'Sanjay Motors', phone: '9823456789', category: 'Supplier'},
  {id: 'c-14', name: 'Vikram Driver', phone: '9812345678', category: 'Driver'},
];

export function ContactsPickerModal({visible, title = 'Choose from Contacts', onSelectContact, onClose}) {
  const [search, setSearch] = useState('');

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return MOCK_CONTACTS;
    const q = search.trim().toLowerCase();
    return MOCK_CONTACTS.filter(
      c => c.name.toLowerCase().includes(q) || c.phone.includes(q),
    );
  }, [search]);

  const handleSelect = contact => {
    onSelectContact(contact);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Back">
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <AppText variant="heading" style={styles.headerTitle}>
              {title}
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <View style={styles.searchField}>
              <Icon name="account-search-outline" size={20} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search contact name or number..."
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoFocus={Platform.OS !== 'ios'}
                returnKeyType="done"
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Contacts List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            renderItem={({item}) => {
              const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';
              return (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}>
                  <View style={styles.avatarCircle}>
                    <AppText variant="label" style={styles.avatarText}>
                      {initial}
                    </AppText>
                  </View>
                  <View style={styles.contactInfo}>
                    <AppText variant="body" style={styles.contactName}>
                      {item.name}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {item.phone} • {item.category}
                    </AppText>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText variant="body" color="textMuted">
                  No contacts found.
                </AppText>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 24,
  },
  searchContainer: {
    padding: spacing.md,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    padding: 0,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
});
