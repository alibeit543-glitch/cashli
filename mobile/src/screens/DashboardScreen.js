import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { walletAPI, levelsAPI, bonusesAPI } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [bonus, setBonus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, bonusRes] = await Promise.all([
        walletAPI.getBalance(),
        bonusesAPI.check(),
      ]);
      setData(walletRes.data);
      setBonus(bonusRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const claimDaily = async () => {
    try {
      await bonusesAPI.claimDaily();
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Already claimed today');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('cashli_token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {bonus && (
        <TouchableOpacity style={[styles.bonusBtn, !bonus.canClaim && styles.bonusClaimed]} onPress={claimDaily} disabled={!bonus.canClaim}>
          <Text style={styles.bonusText}>
            {bonus.canClaim ? `Daily Bonus (Streak: ${bonus.streak || 0})` : 'Claimed Today'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{data?.balance || 0} coins</Text>
        <Text style={styles.balanceUsd}>≈ ${((data?.balance || 0) / 100).toFixed(2)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.totalEarned || 0}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{data?.xp || 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: 'Offers', screen: 'Offers', color: '#6366f1' },
          { label: 'Withdraw', screen: 'Withdraw', color: '#22c55e' },
          { label: 'Referrals', screen: 'Referrals', color: '#f59e0b' },
          { label: 'Levels', screen: 'Levels', color: '#ec4899' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionBtn, { backgroundColor: action.color + '20', borderColor: action.color + '40' }]}
            onPress={() => navigation.navigate(action.screen)}
          >
            <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#e2e8f0' },
  logout: { color: '#ef4444', fontSize: 14 },
  bonusBtn: {
    backgroundColor: '#f59e0b', borderRadius: 10, padding: 14, marginBottom: 16,
  },
  bonusClaimed: { backgroundColor: '#2a2a4a' },
  bonusText: { color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 14 },
  balanceCard: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: '#94a3b8' },
  balanceAmount: { fontSize: 36, fontWeight: '800', color: '#e2e8f0', marginVertical: 4 },
  balanceUsd: { fontSize: 14, color: '#64748b' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#e2e8f0' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#e2e8f0', marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: {
    width: '47%', padding: 20, borderRadius: 12,
    borderWidth: 1, alignItems: 'center',
  },
  actionLabel: { fontSize: 16, fontWeight: '600' },
});

export default DashboardScreen;
