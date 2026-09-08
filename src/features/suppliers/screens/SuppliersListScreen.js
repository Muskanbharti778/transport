import React, {useMemo, useState} from 'react';
import {FlatList, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {SupplierListItem} from '../components/SupplierListItem';
import {useSuppliersQuery} from '../hooks/useSuppliersQuery';
import {routes} from '../../../navigation/routeNames';
import {colors, radius, spacing} from '../../../theme';

export default function SuppliersListScreen() {
  const navigation = useNavigation();
  const {data: suppliers, isLoading, isError, refetch, isRefetching} = useSuppliersQuery();
  const [search, setSearch] = useState('');

  const filteredSuppliers = useMemo(() => {
    if (!suppliers) return [];
    if (!search.trim()) return suppliers;
    const query = search.trim().toLowerCase();
    return suppliers.filter(
      supplier =>
        (supplier.suppliername &&
          supplier.suppliername.toLowerCase().includes(query)) ||
        (supplier.mobile && supplier.mobile.includes(query)) ||
        (supplier.contactperson && supplier.contactperson.toLowerCase().includes(query)),
    );
  }, [suppliers, search]);

  const activeCount = useMemo(
    () => (suppliers || []).filter(s => Number(s.status) === 1).length,
    [suppliers],
  );

  return (
    <AppScreen scroll={false} style={styles.screen} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <View>
          <AppText variant="heading" style={styles.title}>
            Suppliers
          </AppText>
          <AppText variant="caption" color="textMuted">
            {suppliers ? `${suppliers.length} Total • ${activeCount} Active` : 'Vendors & suppliers'}
          </AppText>
        </View>
        <AppButton
          title="Add Supplier"
          onPress={() => navigation.navigate(routes.addSupplier)}
          style={styles.addButton}
        />
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchField}>
          <Icon name="magnify" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search suppliers..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      {isLoading ? (
        <AppText variant="body" color="textMuted" style={styles.centerMessage}>
          Loading suppliers...
        </AppText>
      ) : isError ? (
        <View style={styles.centerMessage}>
          <AppText variant="body" color="danger">
            Couldn't load suppliers.
          </AppText>
          <AppButton title="Retry" onPress={() => refetch()} style={styles.retryButton} />
        </View>
      ) : filteredSuppliers.length === 0 ? (
        <View style={styles.centerMessage}>
          <Icon name="domain" size={48} color={colors.textMuted} />
          <AppText variant="body" color="textMuted">
            {search ? 'No suppliers match your search.' : 'No suppliers yet.'}
          </AppText>
          {!search && (
            <AppButton
              title="Add your first supplier"
              onPress={() => navigation.navigate(routes.addSupplier)}
              style={styles.retryButton}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredSuppliers}
          keyExtractor={item => item.id}
          onRefresh={refetch}
          refreshing={isRefetching}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={({item}) => (
            <SupplierListItem supplier={item} onPress={() => {}} />
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
