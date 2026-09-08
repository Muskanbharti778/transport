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

export function SelectOptionModal({
  visible,
  title,
  options = [],
  selectedValue,
  onSelect,
  onClose,
  allowCustom = true,
  placeholder = 'Search...',
  topActions = [],
}) {
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(opt => {
      const label = typeof opt === 'string' ? opt : opt.label || opt.name || '';
      return label.toLowerCase().includes(q);
    });
  }, [options, search]);

  const handleSelect = opt => {
    onSelect(opt);
    setSearch('');
    onClose();
  };

  const handleSelectCustom = () => {
    if (search.trim()) {
      onSelect(search.trim());
      setSearch('');
      onClose();
    }
  };

  const isExactMatch = filteredOptions.some(opt => {
    const label = typeof opt === 'string' ? opt : opt.label || opt.name || '';
    return label.toLowerCase() === search.trim().toLowerCase();
  });

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

          {/* Search Field */}
          <View style={styles.searchContainer}>
            <View style={styles.searchField}>
              <Icon name="magnify" size={20} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={placeholder}
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

          {/* Top Actions (e.g. Add Party, Choose from Contacts) */}
          {topActions && topActions.length > 0 ? (
            <View style={styles.topActionsContainer}>
              {topActions.map((act, i) => (
                <TouchableOpacity
                  key={`top-action-${i}`}
                  style={[
                    styles.topActionButton,
                    act.disabled && styles.topActionButtonDisabled,
                  ]}
                  onPress={() => {
                    if (act.disabled) return;
                    onClose();
                    act.onPress();
                  }}
                  activeOpacity={0.7}
                  disabled={act.disabled}>
                  <Icon
                    name={act.icon || 'plus-circle'}
                    size={18}
                    color={act.disabled ? colors.textMuted : colors.primary}
                  />
                  <AppText
                    variant="label"
                    style={[
                      styles.topActionText,
                      act.disabled && styles.topActionTextDisabled,
                    ]}>
                    {act.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {/* Custom entry if not in options */}
          {allowCustom && search.trim().length > 0 && !isExactMatch ? (
            <TouchableOpacity
              style={styles.customOptionRow}
              onPress={handleSelectCustom}>
              <Icon name="plus-circle" size={20} color={colors.primary} />
              <AppText variant="body" style={styles.customOptionText}>
                Use "{search.trim()}"
              </AppText>
            </TouchableOpacity>
          ) : null}

          {/* Option List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item, index) =>
              typeof item === 'string' ? `${item}-${index}` : item.id || `${item.value}-${index}`
            }
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={OptionSeparator}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => {
              if (typeof item === 'object' && item.isHeader) {
                return (
                  <View style={styles.sectionHeaderRow}>
                    <AppText variant="caption" style={styles.sectionHeaderText}>
                      {item.title}
                    </AppText>
                  </View>
                );
              }

              const label = typeof item === 'string' ? item : item.label || item.name;
              const sublabel = typeof item === 'object' ? item.sublabel || item.category : null;
              const value = typeof item === 'string' ? item : item.value || item.name;
              const isSelected = selectedValue === value;
              const ownership = typeof item === 'object' ? item.ownership : null;
              const status = typeof item === 'object' ? item.status : null;
              const isMarket = ownership === 'market' || ownership === 'Market';

              const initials = label && label.length >= 2 ? label.substring(0, 2).toUpperCase() : 'TR';

              return (
                <TouchableOpacity
                  style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}>
                  {ownership ? (
                    <View style={styles.avatarCircle}>
                      <AppText variant="caption" style={styles.avatarText}>
                        {initials}
                      </AppText>
                    </View>
                  ) : null}

                  <View style={styles.optionInfo}>
                    <View style={styles.optionTopRow}>
                      <AppText
                        variant="body"
                        style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {label}
                      </AppText>

                      {/* Ownership Badge if available */}
                      {ownership ? (
                        <View
                          style={[
                            styles.badge,
                            isMarket ? styles.marketBadge : styles.ownBadge,
                          ]}>
                          <AppText style={styles.badgeText}>
                            {isMarket ? 'Market' : 'Own'}
                          </AppText>
                        </View>
                      ) : null}

                      {/* Status badge if available */}
                      {status ? (
                        <View style={styles.statusRow}>
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  status === 'on_trip' || status === 'On Trip'
                                    ? '#2563EB'
                                    : '#16A34A',
                              },
                            ]}
                          />
                          <AppText
                            variant="caption"
                            style={{
                              color:
                                status === 'on_trip' || status === 'On Trip'
                                  ? '#2563EB'
                                  : '#16A34A',
                              fontWeight: '600',
                              fontSize: 12,
                            }}>
                            {status === 'on_trip' || status === 'On Trip'
                              ? 'On Trip'
                              : 'Available'}
                          </AppText>
                        </View>
                      ) : null}
                    </View>

                    {sublabel ? (
                      <AppText variant="caption" color="textMuted" style={{marginTop: 2}}>
                        {sublabel}
                      </AppText>
                    ) : null}
                  </View>
                  {isSelected ? (
                    <Icon name="check" size={20} color={colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              !allowCustom || !search.trim() ? (
                <View style={styles.emptyContainer}>
                  <AppText variant="body" color="textMuted">
                    No matching options found.
                  </AppText>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function OptionSeparator() {
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  topActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  topActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  topActionButtonDisabled: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    opacity: 0.7,
  },
  topActionText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  topActionTextDisabled: {
    color: colors.textMuted,
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
  customOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  customOptionText: {
    fontWeight: '600',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  optionRowSelected: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  sectionHeaderRow: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  sectionHeaderText: {
    fontWeight: '800',
    color: '#64748B',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  avatarText: {
    fontWeight: '800',
    color: '#334155',
    fontSize: 14,
  },
  optionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ownBadge: {
    backgroundColor: '#2563EB',
  },
  marketBadge: {
    backgroundColor: '#EA580C',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
