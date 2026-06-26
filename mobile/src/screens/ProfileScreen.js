import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { levelsAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await levelsAPI.getProgress();
        setProgress(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('cashli_token');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.levelCard}>
        <Text style={styles.levelTitle}>Level {progress?.current?.level || 1}</Text>
        <Text style={styles.levelName}>{progress?.current?.name || 'Bronze'}</Text>
        {progress?.next && (
          <Text style={styles.levelProgress}>
            {progress.progress}% to Level {progress.next.level}
          </Text>
        )}
      </View>

      <View style={styles.menuItems}>
        {[
          { label: 'Referrals', screen: 'Referrals' },
          { label: 'Levels', screen: 'Levels' },
          { label: 'Withdraw', screen: 'Withdraw' },
        ].map((item) => (
          <View key={item.label} style={styles.menuItem}>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.logout} onPress={handleLogout}>Logout</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0', marginBottom: 20, marginTop: 8 },
  levelCard: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  levelTitle: { fontSize: 40, fontWeight: '800', color: '#6366f1' },
  levelName: { fontSize: 18, color: '#94a3b8', marginTop: 4 },
  levelProgress: { fontSize: 14, color: '#6366f1', marginTop: 8 },
  menuItems: { gap: 4 },
  menuItem: {
    paddingVertical: 16, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a2a4a',
  },
  menuLabel: { fontSize: 16, color: '#e2e8f0', fontWeight: '500' },
  logout: { color: '#ef4444', fontSize: 16, fontWeight: '600', textAlign: 'center', marginTop: 40 },
});

export default ProfileScreen;
