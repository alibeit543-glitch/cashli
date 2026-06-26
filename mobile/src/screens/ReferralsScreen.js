import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { referralsAPI } from '../services/api';

const ReferralsScreen = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await referralsAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refer & Earn</Text>
      <Text style={styles.subtitle}>Earn 50 coins per referral!</Text>

      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>Your Referral Code</Text>
        <Text style={styles.code}>{stats?.referralCode || '------'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.credited || 0}</Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Referrals</Text>
      <FlatList
        data={stats?.referrals || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.refItem}>
            <Text style={styles.refName}>{item.referred?.username}</Text>
            <Text style={styles.refStatus}>{item.status}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 20 },
  codeBox: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  codeLabel: { fontSize: 13, color: '#94a3b8' },
  code: { fontSize: 24, fontWeight: '800', color: '#6366f1', letterSpacing: 2, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#e2e8f0', marginBottom: 12 },
  list: { paddingBottom: 20 },
  refItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a4a',
  },
  refName: { color: '#e2e8f0', fontWeight: '500' },
  refStatus: { color: '#f59e0b', fontSize: 13, textTransform: 'capitalize' },
});

export default ReferralsScreen;
