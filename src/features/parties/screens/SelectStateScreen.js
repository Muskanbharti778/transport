import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {INDIAN_STATES} from '../constants/indianStates';
import {colors, radius, spacing} from '../../../theme';

export default function SelectStateScreen({navigation, route}) {
  const {selectedState, onSelect} = route.params || {};
  const [search, setSearch] = useState('');

  const filteredStates = useMemo(() => {
    if (!search.trim()) return INDIAN_STATES;
    const query = search.trim().toLowerCase();
    return INDIAN_STATES.filter(state => state.toLowerCase().includes(query));
  }, [search]);

  const handleSelect = state => {
    onSelect?.(state);
    navigation.goBack();
  };

  return (
    <AppScreen scroll={false} style={styles.screen}>
      <View style={styles.topRow}>
        <View style={styles.searchField}>
          <Icon name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search state..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            autoFocus
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close"
          style={styles.closeButton}>
          <Icon name="close" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredStates}
        keyExtractor={item => item}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={StateSeparator}
        style={styles.list}
        renderItem={({item}) => (
          <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
            <AppText variant="body">{item}</AppText>
            {item === selectedState ? (
              <Icon name="check" size={18} color={colors.primary} />
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <AppText variant="body" color="textMuted" style={styles.emptyText}>
            No states match your search.
          </AppText>
        }
      />
    </AppScreen>
  );
}

function StateSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    padding: 0,
  },
  list: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});