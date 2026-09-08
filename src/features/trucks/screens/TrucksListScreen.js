import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {TruckListItem} from '../components/TruckListItem';
import {useTrucksQuery} from '../hooks/useTrucksQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

export default function TrucksListScreen() {
  const navigation = useNavigation();
  const {data: trucks, isLoading, isError, refetch, isRefetching} = useTrucksQuery();
  const [search, setSearch] = useState('');

  const filteredTrucks = useMemo(() => {
    if (!trucks) return [];
    if (!search.trim()) return trucks;
    const query = search.trim().toLowerCase();
    return trucks.filter(
      truck =>
        (truck.vehicleNumber && truck.vehicleNumber.toLowerCase().includes(query)) ||
        (truck.vehicleTypeName && truck.vehicleTypeName.toLowerCase().includes(query)),
    );
  }, [trucks, search]);

  const activeCount = useMemo(
    () => (trucks || []).filter(t => t.status !== 'maintenance').length,
    [trucks],
  );

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <View>
          <AppText variant="heading" style={styles.title}>
            Trucks
          </AppText>
          <AppText variant="caption" color="textMuted">
            {trucks ? `${trucks.length} Total • ${activeCount} Active` : 'Fleet vehicles'}
          </AppText>
        </View>
        <AppButton
          title="Add Truck"
          onPress={() => navigation.navigate(routes.addTruck)}
          style={styles.addButton}
        />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <Icon name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search trucks..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      {isLoading ? (
        <AppText variant="body" color="textMuted" style={styles.centerMessage}>
          Loading trucks...
        </AppText>
      ) : isError ? (
        <View style={styles.centerMessage}>
          <AppText variant="body" color="danger">
            Couldn't load trucks.
          </AppText>
          <AppButton title="Retry" onPress={() => refetch()} style={styles.retryButton} />
        </View>
      ) : filteredTrucks.length === 0 ? (
        <View style={styles.centerMessage}>
          <Icon name="truck-outline" size={48} color={colors.textMuted} />
          <AppText variant="body" color="textMuted">
            {search ? 'No trucks match your search.' : 'No trucks yet.'}
          </AppText>
          {!search && (
            <AppButton
              title="Add your first truck"
              onPress={() => navigation.navigate(routes.addTruck)}
              style={styles.retryButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTrucks}
          keyExtractor={item => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({item}) => <TruckListItem truck={item} onPress={() => {}} />}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  toolbar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchField: {
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
});
