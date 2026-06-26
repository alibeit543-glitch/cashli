import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { walletAPI } from '../services/api';

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [balRes, txnRes] = await Promise.all([
          walletAPI.getBalance(),
          walletAPI.getTransactions({ limit: 50 }),
        ]);
        setBalance(balRes.data);
        setTransactions(txnRes.data.transactions);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{balance?.balance || 0} coins</Text>
        <TouchableOpacity style={styles.withdrawBtn} onPress={() => navigation.navigate('Withdraw')}>
          <Text style={styles.withdrawBtnText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.txnItem}>
            <View style={styles.txnInfo}>
              <Text style={styles.txnDesc}>{item.description}</Text>
              <Text style={styles.txnDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.txnAmount, { color: item.amount > 0 ? '#22c55e' : '#ef4444' }]}>
              {item.amount > 0 ? '+' : ''}{item.amount.toFixed(0)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0', marginBottom: 16, marginTop: 8 },
  balanceCard: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: '#94a3b8' },
  balanceAmount: { fontSize: 32, fontWeight: '800', color: '#e2e8f0', marginVertical: 8 },
  withdrawBtn: { backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  withdrawBtnText: { color: 'white', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#e2e8f0', marginBottom: 12 },
  list: { paddingBottom: 20 },
  txnItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a4a',
  },
  txnInfo: { flex: 1 },
  txnDesc: { fontSize: 14, color: '#e2e8f0', fontWeight: '500' },
  txnDate: { fontSize: 12, color: '#64748b', marginTop: 2 },
  txnAmount: { fontSize: 16, fontWeight: '700' },
});

export default WalletScreen;
