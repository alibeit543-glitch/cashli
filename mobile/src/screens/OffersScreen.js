import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { offersAPI } from '../services/api';

const categoryIcons = { survey: '📋', offer: '🎯', video: '🎬', 'app-download': '📱', signup: '✍️', purchase: '🛒' };

const OfferCard = ({ offer, onPress }) => (
  <TouchableOpacity style={styles.offerCard} onPress={onPress}>
    <View style={styles.offerHeader}>
      <Text style={styles.categoryBadge}>{categoryIcons[offer.category]} {offer.category}</Text>
      {offer.isFeatured && <Text style={styles.featured}>Featured</Text>}
    </View>
    <Text style={styles.offerTitle}>{offer.title}</Text>
    <Text style={styles.offerDesc} numberOfLines={2}>{offer.shortDescription || offer.description}</Text>
    <View style={styles.offerFooter}>
      <Text style={styles.reward}>+{offer.reward} coins</Text>
      <Text style={styles.slots}>{offer.totalSlots - offer.completedSlots} left</Text>
    </View>
  </TouchableOpacity>
);

const OffersScreen = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await offersAPI.getAll({ limit: 50 });
        setOffers(res.data.offers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const startOffer = async (offer) => {
    try {
      await offersAPI.startOffer(offer._id);
      Alert.alert('Started!', `You started: ${offer.title}`);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earn Offers</Text>
      <FlatList
        data={offers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <OfferCard offer={item} onPress={() => startOffer(item)} />}
        refreshing={loading}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#e2e8f0', marginBottom: 16, marginTop: 8 },
  list: { paddingBottom: 20 },
  offerCard: {
    backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#2a2a4a',
  },
  offerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: { color: '#818cf8', fontSize: 12, fontWeight: '500' },
  featured: { color: '#f59e0b', fontSize: 11, fontWeight: '600' },
  offerTitle: { fontSize: 16, fontWeight: '600', color: '#e2e8f0', marginBottom: 4 },
  offerDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 12 },
  offerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reward: { color: '#22c55e', fontWeight: '700', fontSize: 16 },
  slots: { color: '#64748b', fontSize: 12 },
});

export default OffersScreen;
