import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      await AsyncStorage.setItem('cashli_token', res.data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.brand}>Cashli</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue earning</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', justifyContent: 'center' },
  content: { padding: 32 },
  brand: { fontSize: 32, fontWeight: '800', color: '#6366f1', textAlign: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#e2e8f0', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 32, marginTop: 4 },
  input: {
    backgroundColor: '#16162a', borderWidth: 1, borderColor: '#2a2a4a',
    borderRadius: 10, padding: 14, fontSize: 16, color: '#e2e8f0',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#6366f1', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 12,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366f1', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default LoginScreen;
