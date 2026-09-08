import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppButton} from '../../../components/common/AppButton';
import {AppCard} from '../../../components/common/AppCard';
import {AppHeader} from '../../../components/common/AppHeader';
import {AppScreen} from '../../../components/common/AppScreen';
import {AppText} from '../../../components/common/AppText';
import {useAuthStore} from '../../../store/authStore';
import {authApi} from '../../auth/auth.api';
import {colors, radius, spacing} from '../../../theme';

export default function AccountScreen() {
  const session = useAuthStore(state => state.session);
  const logout = useAuthStore(state => state.logout);

  const [user, setUser] = useState(session?.user || {});

  useEffect(() => {
    const token = session?.accessToken;
    if (!token) return;
    let active = true;
    authApi
      .getCurrentUser(token)
      .then(response => {
        if (!active) return;
        const payload = response?.data || response;
        const latest = payload?.user || payload;
        const merged = {...user, ...latest};
        setUser(merged);
      })
      .catch(() => {
        // Offline or backend unreachable — keep the login response details.
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = user.username || user.name || user.email || 'Account';
  const initial = name.charAt(0).toUpperCase();
  const email = user.email || '—';
  const mobile = user.mobile || '—';
  const userid = user.userid != null ? String(user.userid) : '—';
  const companyid = user.companyid != null ? String(user.companyid) : '—';

  return (
    <AppScreen>
      <AppHeader
        title="Account"
        subtitle="Your profile, login details and company access."
      />
      <AppCard style={styles.profileCard}>
        <View style={styles.avatar}>
          <AppText variant="heading" style={styles.avatarText}>
            {initial}
          </AppText>
        </View>
        <View style={styles.profileIdentity}>
          <AppText variant="heading" style={styles.profileName}>
            {name}
          </AppText>
          <AppText variant="body" color="textMuted" numberOfLines={1}>
            {email}
          </AppText>
        </View>
      </AppCard>

      <AppText variant="label" color="textMuted" style={styles.sectionTitle}>
        Contact details
      </AppText>
      <AppCard style={styles.detailsCard}>
        <DetailRow icon="cellphone" label="Mobile number" value={mobile} />
        <DetailRow icon="email-outline" label="Email" value={email} />
        <DetailRow icon="account-key-outline" label="User ID" value={userid} />
        {companyid !== '—' ? (
          <DetailRow icon="office-building-outline" label="Company ID" value={companyid} last />
        ) : null}
      </AppCard>

      <View style={styles.logout}>
        <AppButton title="Log out" variant="secondary" onPress={logout} />
      </View>
    </AppScreen>
  );
}

function DetailRow({icon, label, value, last}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailIcon}>
        <Icon name={icon} size={18} color={colors.primaryDark} />
      </View>
      <View style={styles.detailText}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="body">{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 24,
  },
  profileIdentity: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    color: colors.surface,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  detailsCard: {
    paddingHorizontal: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  detailRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    flex: 1,
    gap: 2,
  },
  logout: {
    marginTop: spacing.xl,
  },
});