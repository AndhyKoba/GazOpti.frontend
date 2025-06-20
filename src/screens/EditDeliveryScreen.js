import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator, // Added ActivityIndicator for loading
  SafeAreaView // Added for better handling of notches/status bars
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { LinearGradient } from 'expo-linear-gradient'; // Added for consistent background

export default function EditDeliveryScreen({ navigation }) { // Added navigation prop
  const [deliveryId, setDeliveryId] = useState('');
  const [fullBottlesSent, setFullBottlesSent] = useState('');
  const [emptyBottlesSent, setEmptyBottlesSent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false); // New state for submit button loading

  const handleEdit = async () => {
    // Basic validation
    if (!deliveryId || fullBottlesSent.trim() === '' || emptyBottlesSent.trim() === '') {
      Alert.alert('Erreur', 'Veuillez renseigner l\'ID de la livraison et les quantités.');
      return;
    }

    setSubmitLoading(true); // Start loading for submit button
    try {
      // Fetch token from AsyncStorage, don't hardcode it!
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Token introuvable. Veuillez vous reconnecter.');
        navigation.navigate('LoginController'); // Navigate to login if no token
        return;
      }

      console.log(`[EditDeliveryScreen] Attempting to edit delivery ID: ${deliveryId}`);
      console.log(`[EditDeliveryScreen] Sending data: Full=${fullBottlesSent}, Empty=${emptyBottlesSent}`);

      const response = await fetch(`http://31.97.55.154:5000/api/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullBottlesSent: Number(fullBottlesSent),
          emptyBottlesSent: Number(emptyBottlesSent),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Try to parse error message from backend
        console.error("[EditDeliveryScreen] Backend error response:", errorData);
        throw new Error(errorData.message || 'Erreur lors de la modification de la livraison.');
      }

      Alert.alert('Succès', 'Livraison modifiée !');
      // Optionally clear fields or navigate after success
      setDeliveryId('');
      setFullBottlesSent('');
      setEmptyBottlesSent('');
      // Navigate back or to SeeDelivery to confirm change
      navigation.navigate('SeeDelivery');
    } catch (err) {
      console.error("[EditDeliveryScreen] Error during delivery edit:", err);
      Alert.alert('Erreur', err.message);
    } finally {
      setSubmitLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <LinearGradient
      colors={['#f0f2f7', '#f9f9f7']} // Soft light gradient for background
      style={styles.fullScreenGradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.headerTitle}>Modifier une Livraison</Text>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Détails de la Modification</Text>

            <Text style={styles.label}>ID de la livraison</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 60d5ec49f7e5b10015f8a2c1"
              placeholderTextColor="#7B7C7B"
              value={deliveryId}
              onChangeText={setDeliveryId}
              autoCapitalize="none" // Assuming IDs are alphanumeric, no auto-capitalization needed
            />

            <Text style={styles.label}>Nouvelles bouteilles pleines envoyées</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantité de bouteilles pleines"
              placeholderTextColor="#7B7C7B"
              value={fullBottlesSent}
              onChangeText={(text) => setFullBottlesSent(text.replace(/[^0-9]/g, ''))} // Allow only numeric input
              keyboardType="numeric"
            />

            <Text style={styles.label}>Nouvelles bouteilles vides envoyées</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantité de bouteilles vides"
              placeholderTextColor="#7B7C7B"
              value={emptyBottlesSent}
              onChangeText={(text) => setEmptyBottlesSent(text.replace(/[^0-9]/g, ''))} // Allow only numeric input
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
              onPress={handleEdit}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color="#f0f2f7" />
              ) : (
                <Text style={styles.primaryButtonText}>Modifier la Livraison</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('CreateDelivery')}>
              <Text style={styles.secondaryButtonText}>Créer une Nouvelle Livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SeeDelivery')}>
              <Text style={styles.secondaryButtonText}>Voir les Livraisons</Text>
            </TouchableOpacity>
          </View>

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#292d31',
    marginBottom: 30,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#292d31',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#292d31',
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    color: '#292d31',
    borderColor: '#D1D5DA',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#991930',
    paddingVertical: 16,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#490815',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#f0f2f7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  navigationButtonsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 20,
    gap: 10, // Requires React Native 0.71+
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#4A4A4A',
    fontSize: 16,
    fontWeight: '600',
  },
});