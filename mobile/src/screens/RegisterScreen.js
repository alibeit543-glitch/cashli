import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    setLoading(true);
    try {
      const res = await authAPI.register({ username, email, password });
      await AsyncStorage.setItem('cashli_token', res.data.token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.brand}>Cashli</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Start earning real rewards today</Text>

        <TextInput
          style={styles.input} placeholder="Username" placeholderTextColor="#64748b"
          value={username} onChangeText={setUsername} autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Email" placeholderTextColor="#64748b"
          value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
        />
        <TextInput
          style={styles.input} placeholder="Password (min 6 characters)" placeholderTextColor="#64748b"
          value={password} onChangeText={setPassword} secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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
    borderRadius: 10, padding: 14, fontSize: 16, color: '#e2e8f0', marginBottom: 12,
  },
  button: {
    backgroundColor: '#6366f1', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 12,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366f1', textAlign: 'center', marginTop: 20, fontSize: 14 },
});

export default RegisterScreen;
