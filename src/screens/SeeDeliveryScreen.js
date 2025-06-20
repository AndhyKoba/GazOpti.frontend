import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView, Alert,
  SafeAreaView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <-- KEEP THIS IMPORT
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function SeeDeliveryScreen({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchDeliveries = async () => {
        console.log("[SeeDeliveryScreen] Fetching deliveries...");
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem('token');
          if (!token) {
            console.warn("[SeeDeliveryScreen] Token not found. Navigating to Login.");
            if (isActive) {
              Alert.alert('Erreur', 'Token introuvable. Veuillez vous reconnecter.');
              navigation.navigate('LoginController');
            }
            return;
          }

          const res = await fetch('http://31.97.55.154:5000/api/deliveries', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error(`[SeeDeliveryScreen] Failed to fetch deliveries: ${res.status} ${res.statusText} - ${errorText}`);
            throw new Error(errorText || `Échec de la récupération des livraisons: ${res.status}`);
          }

          const data = await res.json();
          console.log("[SeeDeliveryScreen] Deliveries data received:", data);
          if (isActive) {
            setDeliveries(Array.isArray(data) ? data : []);
          }
        } catch (e) {
          console.error("[SeeDeliveryScreen] Error fetching deliveries:", e);
          if (isActive) Alert.alert('Erreur', 'Impossible de charger les livraisons. Détails: ' + e.message);
        } finally {
          if (isActive) {
            console.log("[SeeDeliveryScreen] Fetching finished. Setting loading to false.");
            setLoading(false);
          }
        }
      };

      fetchDeliveries();

      return () => { isActive = false; };
    }, [])
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#f0f2f7', '#f9f9f7']}
        style={styles.loadingContainer}>
        <ActivityIndicator color="#991930" size="large" />
        <Text style={styles.loadingText}>Chargement des livraisons...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#f0f2f7', '#f9f9f7']}
      style={styles.fullScreenGradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.headerTitle}>Toutes les Livraisons</Text>

          {deliveries.length === 0 ? (
            <Text style={styles.noDeliveriesText}>Aucune livraison trouvée pour le moment.</Text>
          ) : (
            deliveries.map(delivery => (
              <View key={delivery._id} style={styles.deliveryCard}>
                <Text style={styles.cardTitleText}>Livraison ID: {delivery._id.substring(0, 10)}...</Text>
                <View style={styles.separator} />
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Chauffeur:</Text> {delivery.driver?.name || delivery.driver || 'N/A'}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Camion:</Text> {delivery.truck?.plateNumber || delivery.truck || 'N/A'}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Bouteilles pleines envoyées:</Text> {delivery.fullBottlesSent || 0}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Bouteilles vides envoyées:</Text> {delivery.emptyBottlesSent || 0}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Bouteilles pleines retournées:</Text> {delivery.fullBottlesReturned || 0}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Bouteilles vides retournées:</Text> {delivery.emptyBottlesReturned || 0}</Text>
                <Text style={[styles.cardText, styles.statusText]}><Text style={styles.cardLabel}>Statut:</Text> {delivery.status || 'N/A'}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fullScreenGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#292d31',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#292d31',
    marginBottom: 30,
    textAlign: 'center',
  },
  noDeliveriesText: {
    fontSize: 18,
    color: '#4A4A4A',
    marginTop: 20,
    textAlign: 'center',
  },
  deliveryCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#991930',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#292d31',
    marginBottom: 5,
  },
  cardLabel: {
    fontWeight: '600',
    color: '#4A4A4A',
  },
  statusText: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#991930',
  },
});