import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { withdrawalsAPI } from '../services/api';

const methods = [
  { id: 'paypal', name: 'PayPal', minAmount: 500 },
  { id: 'crypto', name: 'Cryptocurrency', minAmount: 1000 },
  { id: 'giftcard', name: 'Gift Card', minAmount: 200 },
];

const WithdrawScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState({});

  const handleSubmit = async () => {
    try {
      await withdrawalsAPI.request({
        amount: parseFloat(amount),
        method: selectedMethod.id,
        accountDetails,
      });
      Alert.alert('Success', 'Withdrawal request submitted!');
      setAmount('');
      setSelectedMethod(null);
      setAccountDetails({});
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Withdraw Funds</Text>

      {methods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[styles.methodCard, selectedMethod?.id === method.id && styles.methodSelected]}
          onPress={() => setSelectedMethod(method)}
        >
          <Text style={styles.methodName}>{method.name}</Text>
          <Text style={styles.methodMin}>Min: {method.minAmount} coins</Text>
        </TouchableOpacity>
      ))}

      {selectedMethod && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder={`Amount (min ${selectedMethod.minAmount})`}
            placeholderTextColor="#64748b"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          {selectedMethod.id === 'paypal' && (
            <TextInput
              style={styles.input}
              placeholder="PayPal Email"
              placeholderTextColor="#64748b"
              value={accountDetails.email || ''}
              onChangeText={(text) => setAccountDetails({ ...accountDetails, email: text })}
            />
          )}
          {selectedMethod.id === 'crypto' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Wallet Address"
                placeholderTextColor="#64748b"
                value={accountDetails.address || ''}
                onChangeText={(text) => setAccountDetails({ ...accountDetails, address: text })}
              />
            </>
          )}
          {selectedMethod.id === 'giftcard' && (
            <TextInput
              style={styles.input}
              placeholder="Email for delivery"
              placeholderTextColor="#64748b"
              value={accountDetails.email || ''}
              onChangeText={(text) => setAccountDetails({ ...accountDetails, email: text })}
            />
          )}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Withdraw {amount || '0'} Coins</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0', marginBottom: 16, marginTop: 8 },
  methodCard: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#2a2a4a',
  },
  methodSelected: { borderColor: '#6366f1', backgroundColor: '#6366f110' },
  methodName: { fontSize: 16, fontWeight: '600', color: '#e2e8f0' },
  methodMin: { fontSize: 12, color: '#64748b', marginTop: 4 },
  form: { marginTop: 16 },
  input: {
    backgroundColor: '#16162a', borderWidth: 1, borderColor: '#2a2a4a',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#e2e8f0', marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#6366f1', borderRadius: 10, padding: 16, alignItems: 'center',
  },
  submitText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default WithdrawScreen;
