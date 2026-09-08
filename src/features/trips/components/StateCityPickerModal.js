import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import {useCitiesQuery} from '../../cities/hooks/useCitiesQuery';
import {useStatesQuery} from '../../states/hooks/useStatesQuery';
import {colors, radius, spacing} from '../../../theme';

export function StateCityPickerModal({
  visible,
  title = 'Select Location',
  onSelectLocation,
  onClose,
}) {
  const {data: apiCities, isLoading: citiesLoading} = useCitiesQuery();
  const {data: apiStates, isLoading: statesLoading} = useStatesQuery();
  const [selectedState, setSelectedState] = useState(null);
  const [search, setSearch] = useState('');

  const step = selectedState ? 'city' : 'state';

  // States come only from the backend (stateid + statename).
  const stateOptions = useMemo(() => {
    const seen = new Set();
    const states = (apiStates || []).reduce((acc, s) => {
      const name = s?.name;
      if (name && !seen.has(name)) {
        seen.add(name);
        acc.push(name);
      }
      return acc;
    }, []);
    return states.sort((a, b) => a.localeCompare(b));
  }, [apiStates]);

  const filteredStates = useMemo(() => {
    if (!search.trim()) return stateOptions;
    const q = search.trim().toLowerCase();
    return stateOptions.filter(st => st.toLowerCase().includes(q));
  }, [search, stateOptions]);

  // Cities come only from the backend (cityid + cityname + statename).
  const cityEntries = useMemo(() => {
    const seen = new Set();
    return (apiCities || []).reduce((acc, c) => {
      const id = c?.id;
      const name = c?.name;
      const stateName = c?.stateName || '';
      if (!id || !name) return acc;
      const key = `${name}|${stateName}`;
      if (seen.has(key)) return acc;
      seen.add(key);
      acc.push({id, name, stateName});
      return acc;
    }, []);
  }, [apiCities]);

  const citiesForState = useMemo(() => {
    if (!selectedState) return [];
    return cityEntries.filter(c => c.stateName === selectedState);
  }, [cityEntries, selectedState]);

  const filteredCities = useMemo(() => {
    if (!search.trim()) return citiesForState;
    const q = search.trim().toLowerCase();
    return citiesForState.filter(ct => ct.name.toLowerCase().includes(q));
  }, [citiesForState, search]);

  const isLoading = step === 'state' ? statesLoading : citiesLoading;

  const handleSelectState = state => {
    setSelectedState(state);
    setSearch('');
  };

  const handleSelectCity = cityEntry => {
    const formatted = cityEntry.stateName
      ? `${cityEntry.name}, ${cityEntry.stateName}`
      : cityEntry.name;
    onSelectLocation({cityname: formatted, cityid: cityEntry.id});
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedState(null);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={resetAndClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (step === 'city') {
                  setSelectedState(null);
                  setSearch('');
                } else {
                  resetAndClose();
                }
              }}
              style={styles.closeBtn}
              accessibilityLabel="Back">
              <Icon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <AppText variant="heading" style={styles.headerTitle}>
                {step === 'state' ? `Select State (${title})` : `Select City in ${selectedState}`}
              </AppText>
              {selectedState ? (
                <TouchableOpacity onPress={() => setSelectedState(null)}>
                  <AppText variant="caption" style={styles.changeStateBtn}>
                    Change State
                  </AppText>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchField}>
              <Icon name="map-marker-search-outline" size={20} color={colors.textMuted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={step === 'state' ? 'Search State...' : `Search City in ${selectedState}...`}
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : step === 'state' ? (
            /* Step 1: Select State */
            <FlatList
              data={filteredStates}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={Separator}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  No states available
                </AppText>
              }
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.rowItem}
                  onPress={() => handleSelectState(item)}
                  activeOpacity={0.7}>
                  <Icon name="map-marker-outline" size={20} color={colors.primary} />
                  <AppText variant="body" style={styles.rowText}>
                    {item}
                  </AppText>
                  <Icon name="chevron-right" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            />
          ) : (
            /* Step 2: Select City */
            <FlatList
              data={filteredCities}
              keyExtractor={item => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={Separator}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <AppText variant="body" color="textMuted" style={styles.emptyText}>
                  No cities available in {selectedState}
                </AppText>
              }
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.rowItem}
                  onPress={() => handleSelectCity(item)}
                  activeOpacity={0.7}>
                  <Icon name="city-variant-outline" size={20} color={colors.textMuted} />
                  <AppText variant="body" style={styles.rowText}>
                    {item.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {item.stateName}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          )}
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
  titleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  changeStateBtn: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
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
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
