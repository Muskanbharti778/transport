import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {DriverListItem} from '../components/DriverListItem';
import {useDriversQuery} from '../hooks/useDriversQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

export default function DriversListScreen() {
  const navigation = useNavigation();
  const {data: drivers, isLoading, isError, refetch, isRefetching} = useDriversQuery();
  const [search, setSearch] = useState('');

  const filteredDrivers = useMemo(() => {
    if (!drivers) return [];
    const activeDrivers = drivers.filter(d => Number(d.status) === 1);
    if (!search.trim()) return activeDrivers;
    const query = search.trim().toLowerCase();
    return activeDrivers.filter(
      driver =>
        (driver.drivername && driver.drivername.toLowerCase().includes(query)) ||
        (driver.mobile && driver.mobile.includes(query)),
    );
  }, [drivers, search]);

  const activeCount = filteredDrivers.length;

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <View>
          <AppText variant="heading" style={styles.title}>
            Drivers
          </AppText>
          <AppText variant="caption" color="textMuted">
            {drivers ? `${activeCount} Active Drivers` : 'Fleet drivers'}
          </AppText>
        </View>
        <AppButton
          title="Add Driver"
          onPress={() => navigation.navigate(routes.addDriver)}
          style={styles.addButton}
        />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <Icon name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search drivers..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search ? (
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <AppText variant="body" color="textMuted" style={styles.centerMessage}>
          Loading drivers...
        </AppText>
      ) : isError ? (
        <View style={styles.centerMessage}>
          <AppText variant="body" color="danger">
            Couldn't load drivers.
          </AppText>
          <AppButton title="Retry" onPress={() => refetch()} style={styles.retryButton} />
        </View>
      ) : filteredDrivers.length === 0 ? (
        <View style={styles.centerMessage}>
          <Icon name="account-tie-outline" size={48} color={colors.textMuted} />
          <AppText variant="body" color="textMuted">
            {search ? 'No drivers match your search.' : 'No drivers yet.'}
          </AppText>
          {!search && (
            <AppButton
              title="Add your first driver"
              onPress={() => navigation.navigate(routes.addDriver)}
              style={styles.retryButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={item => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({item}) => (
            <DriverListItem
              driver={item}
              onPress={() => {
                // TODO: navigate to Driver Details/Khata once that screen is built
              }}
            />
          )}
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
