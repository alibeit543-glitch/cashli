import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { levelsAPI } from '../services/api';

const levelColors = ['#8B7355', '#C0C0C0', '#FFD700', '#E5E4E2', '#B9F2FF', '#8A2BE2', '#FF4500', '#FF00FF'];

const LevelsScreen = () => {
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

  const levels = [
    { level: 1, name: 'Bronze', xp: '0+' },
    { level: 2, name: 'Silver', xp: '500+' },
    { level: 3, name: 'Gold', xp: '1,500+' },
    { level: 4, name: 'Platinum', xp: '4,000+' },
    { level: 5, name: 'Diamond', xp: '10,000+' },
    { level: 6, name: 'Elite', xp: '25,000+' },
    { level: 7, name: 'Legend', xp: '50,000+' },
    { level: 8, name: 'Mythic', xp: '100,000+' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Levels</Text>

      {progress && (
        <View style={styles.currentCard}>
          <View style={[styles.levelCircle, { backgroundColor: levelColors[progress.current?.level - 1] || '#6366f1' }]}>
            <Text style={styles.levelNum}>{progress.current?.level}</Text>
          </View>
          <Text style={styles.currentLevel}>Level {progress.current?.level} - {progress.current?.name}</Text>
          {progress.next && (
            <Text style={styles.progressText}>{progress.progress}% to Level {progress.next.level}</Text>
          )}
        </View>
      )}

      <FlatList
        data={levels}
        keyExtractor={(item) => item.level.toString()}
        renderItem={({ item }) => (
          <View style={[styles.levelItem, progress?.current?.level === item.level && styles.activeLevel]}>
            <View style={[styles.levelDot, { backgroundColor: levelColors[item.level - 1] }]}>
              <Text style={styles.dotText}>{item.level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelName}>{item.name}</Text>
              <Text style={styles.levelXp}>{item.xp} XP</Text>
            </View>
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
  currentCard: {
    backgroundColor: '#1a1a2e', borderRadius: 16, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#2a2a4a', alignItems: 'center',
  },
  levelCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  levelNum: { fontSize: 28, fontWeight: '800', color: 'white' },
  currentLevel: { fontSize: 18, fontWeight: '700', color: '#e2e8f0' },
  progressText: { fontSize: 13, color: '#6366f1', marginTop: 4 },
  list: { paddingBottom: 20 },
  levelItem: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#2a2a4a',
  },
  activeLevel: { backgroundColor: '#6366f110', borderRadius: 8 },
  levelDot: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  dotText: { color: 'white', fontWeight: '700' },
  levelInfo: { marginLeft: 12, flex: 1 },
  levelName: { fontSize: 16, fontWeight: '600', color: '#e2e8f0' },
  levelXp: { fontSize: 12, color: '#64748b' },
});

export default LevelsScreen;
