import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {PartyListItem} from '../components/PartyListItem';
import {usePartiesQuery} from '../hooks/usePartiesQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

export default function PartiesListScreen() {
  const navigation = useNavigation();
  const {data: parties, isLoading, isError, refetch, isRefetching} = usePartiesQuery();
  const [search, setSearch] = useState('');

  const filteredParties = useMemo(() => {
    if (!parties) return [];
    if (!search.trim()) return parties;
    const query = search.trim().toLowerCase();
    return parties.filter(
      party =>
        party.name.toLowerCase().includes(query) ||
        party.category.toLowerCase().includes(query),
    );
  }, [parties, search]);

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      <View style={styles.headerWrap}>
        <AppHeader title="Parties" subtitle="Customers and business partners" />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <Icon name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search parties..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
        <AppButton
          title="Add Party"
          onPress={() => navigation.navigate(routes.addParty)}
          style={styles.addButton}
        />
      </View>

      {isLoading ? (
        <AppText variant="body" color="textMuted" style={styles.centerMessage}>
          Loading parties...
        </AppText>
      ) : isError ? (
        <View style={styles.centerMessage}>
          <AppText variant="body" color="danger">
            Couldn't load parties.
          </AppText>
          <AppButton title="Retry" onPress={() => refetch()} style={styles.retryButton} />
        </View>
      ) : filteredParties.length === 0 ? (
        <View style={styles.centerMessage}>
          <AppText variant="body" color="textMuted">
            {search ? 'No parties match your search.' : 'No parties yet.'}
          </AppText>
          {!search && (
            <AppButton
              title="Add your first party"
              onPress={() => navigation.navigate(routes.addParty)}
              style={styles.retryButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredParties}
          keyExtractor={item => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({item}) => (
            <PartyListItem
              party={item}
              onPress={() => {
                // TODO: navigate to Party Details/Khata once that screen is built
                // (your Stitch export has "party_details_khata" ready for this)
              }}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      )}
    </AppScreen>
  );
}

function ItemSeparator() {
  return <View style={{height: spacing.sm}} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
    padding: 0,
  },
  headerWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  centerMessage: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  retryButton: {
    minWidth: 160,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});