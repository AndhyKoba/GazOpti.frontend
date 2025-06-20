import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  SafeAreaView, Dimensions // Import Dimensions for screen height
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen height to help with flexible sizing
const { height: screenHeight } = Dimensions.get('window');

export default function CreateDeliveryScreen({ navigation }) {
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [driver, setDriver] = useState(''); // Holds the _id of the selected driver
  const [truck, setTruck] = useState('');    // Holds the _id of the selected truck
  const [fullBottlesSent, setFullBottlesSent] = useState('');
  const [emptyBottlesSent, setEmptyBottlesSent] = useState('');
  const [loading, setLoading] = useState(true); // Initial loading for data fetch (for initial API calls)
  const [submitLoading, setSubmitLoading] = useState(false); // State for submit button loading

  useEffect(() => {
    const fetchData = async () => {
      console.log("[CreateDeliveryScreen] fetchData started. Setting loading to true.");
      setLoading(true); // Set initial loading to true
      try {
        console.log("[CreateDeliveryScreen] Attempting to get token from AsyncStorage...");
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn("[CreateDeliveryScreen] Token not found in AsyncStorage. Navigating to Login.");
          Alert.alert('Erreur', 'Token introuvable. Veuillez vous reconnecter.');
          setLoading(false); // Stop loading even if token is missing
          navigation.navigate('LoginController');
          return; // Stop execution
        }
        console.log("[CreateDeliveryScreen] Token retrieved successfully.");

        // --- Fetch Drivers ---
        console.log("[CreateDeliveryScreen] Fetching drivers from:", 'http://31.97.55.154:5000/api/users?role=driver');
        const resDrivers = await fetch('http://31.97.55.154:5000/api/users?role=driver', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!resDrivers.ok) {
          const errorText = await resDrivers.text();
          console.error(`[CreateDeliveryScreen] Failed to fetch drivers: ${resDrivers.status} ${resDrivers.statusText} - ${errorText}`);
          throw new Error(errorText || `Échec de la récupération des chauffeurs: ${resDrivers.status}`);
        }
        const driversData = await resDrivers.json();
        console.log("[CreateDeliveryScreen] Drivers data received:", driversData);
        const filteredDrivers = Array.isArray(driversData) ? driversData.filter(d => d.role === 'driver') : [];
        setDrivers(filteredDrivers);
        if (filteredDrivers.length > 0) {
          setDriver(filteredDrivers[0]._id); // Pre-select first driver
        } else {
          console.log("[CreateDeliveryScreen] No drivers found or driversData is not an array, or no 'driver' roles.");
        }


        // --- Fetch Trucks ---
        console.log("[CreateDeliveryScreen] Fetching trucks from:", 'http://31.97.55.154:5000/api/trucks');
        const resTrucks = await fetch('http://31.97.55.154:5000/api/trucks', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!resTrucks.ok) {
          const errorText = await resTrucks.text();
          console.error(`[CreateDeliveryScreen] Failed to fetch trucks: ${resTrucks.status} ${resTrucks.statusText} - ${errorText}`);
          throw new Error(errorText || `Échec de la récupération des camions: ${resTrucks.status}`);
        }
        const trucksData = await resTrucks.json();
        console.log("[CreateDeliveryScreen] Trucks data received:", trucksData);
        setTrucks(Array.isArray(trucksData) ? trucksData : []);
        if (Array.isArray(trucksData) && trucksData.length > 0) {
          setTruck(trucksData[0]._id); // Pre-select first truck
        } else {
          console.log("[CreateDeliveryScreen] No trucks found or trucksData is not an array.");
        }

        console.log("[CreateDeliveryScreen] All data fetched successfully.");

      } catch (e) {
        console.error("[CreateDeliveryScreen] Caught error in fetchData:", e);
        Alert.alert('Erreur', 'Impossible de charger les chauffeurs ou camions. Détails: ' + e.message);
      } finally {
        console.log("[CreateDeliveryScreen] fetchData finished. Setting loading to false.");
        setLoading(false); // Set initial loading to false
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  const handleCreate = async () => {
    // Check if a driver/truck is selected, and if bottles fields are non-empty
    if (!driver || !truck || fullBottlesSent.trim() === '' || emptyBottlesSent.trim() === '') {
      Alert.alert('Erreur', 'Veuillez sélectionner un chauffeur et un camion, et remplir toutes les quantités.');
      return;
    }

    setSubmitLoading(true); // Start loading for submit button
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Token introuvable. Veuillez vous reconnecter.');
        navigation.navigate('LoginController');
        return;
      }

      const response = await fetch('http://31.97.55.154:5000/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          driver,
          truck,
          fullBottlesSent: Number(fullBottlesSent),
          emptyBottlesSent: Number(emptyBottlesSent)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      Alert.alert('Succès', 'Livraison créée avec succès.');
      // Reset form fields after successful submission
      setDriver(drivers.length > 0 ? drivers[0]._id : ''); // Reset to first driver or empty
      setTruck(trucks.length > 0 ? trucks[0]._id : ''); // Reset to first truck or empty
      setFullBottlesSent('');
      setEmptyBottlesSent('');
      navigation.navigate('SeeDelivery'); // Navigate after successful creation
    } catch (err) {
      console.error("[CreateDeliveryScreen] Error creating delivery:", err);
      Alert.alert('Erreur', err.message);
    } finally {
      setSubmitLoading(false); // Stop loading regardless of success or failure
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#f0f2f7', '#f9f9f7']}
        style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#991930" />
        <Text style={styles.loadingText}>Chargement des données...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#f0f2f7', '#f9f9f7']} // Soft light gradient for background
      style={styles.fullScreenGradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Removed ScrollView, replaced with a View that manages content distribution */}
        <View style={styles.contentWrapper}>
          <Text style={styles.headerTitle}>Créer une Nouvelle Livraison</Text>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Détails de la Livraison</Text>

            <Text style={styles.label}>Chauffeur</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={driver}
                style={styles.picker}
                onValueChange={(itemValue) => setDriver(itemValue)}
                itemStyle={styles.pickerItem} // Style for picker items (iOS)
              >
                {/* Conditional rendering of "Select" option if no driver is selected or available */}
                {drivers.length === 0 ? (
                  <Picker.Item label="Aucun chauffeur disponible" value="" enabled={false} style={{ color: '#7B7C7B' }} />
                ) : (
                  <>
                    {!driver && <Picker.Item label="Sélectionner un chauffeur" value="" enabled={false} style={{ color: '#7B7C7B' }} />}
                    {drivers.map((d) => (
                      <Picker.Item key={d._id} label={d.name} value={d._id} />
                    ))}
                  </>
                )}
              </Picker>
            </View>

            <Text style={styles.label}>Camion</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={truck}
                style={styles.picker}
                onValueChange={(itemValue) => setTruck(itemValue)}
                itemStyle={styles.pickerItem} // Style for picker items (iOS)
              >
                {/* Conditional rendering of "Select" option if no truck is selected or available */}
                {trucks.length === 0 ? (
                  <Picker.Item label="Aucun camion disponible" value="" enabled={false} style={{ color: '#7B7C7B' }} />
                ) : (
                  <>
                    {!truck && <Picker.Item label="Sélectionner un camion" value="" enabled={false} style={{ color: '#7B7C7B' }} />}
                    {trucks.map((t) => (
                      // Use plateNumber if available, otherwise fallback to a generic name
                      <Picker.Item key={t._id} label={t.plateNumber || `Camion ${t._id.substring(0, 6)}`} value={t._id} />
                    ))}
                  </>
                )}
              </Picker>
            </View>

            {/* New container for side-by-side bottle inputs */}
            <View style={styles.bottleInputsRow}>
              <View style={styles.bottleInputColumn}>
                <Text style={styles.label}>Bouteilles pleines envoyées</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Quantité"
                  placeholderTextColor="#7B7C7B"
                  value={fullBottlesSent}
                  onChangeText={(text) => setFullBottlesSent(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.bottleInputColumn}>
                <Text style={styles.label}>Bouteilles vides envoyées</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Quantité"
                  placeholderTextColor="#7B7C7B"
                  value={emptyBottlesSent}
                  onChangeText={(text) => setEmptyBottlesSent(text.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, submitLoading && styles.buttonDisabled]}
              onPress={handleCreate}
              disabled={submitLoading} // Disable button while submitting
            >
              {submitLoading ? (
                <ActivityIndicator color="#f0f2f7" />
              ) : (
                <Text style={styles.primaryButtonText}>Créer la Livraison</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('EditDelivery')}>
              <Text style={styles.secondaryButtonText}>Modifier une Livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('SeeDelivery')}>
              <Text style={styles.secondaryButtonText}>Voir les Livraisons</Text>
            </TouchableOpacity>
          </View>

        </View>
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
  contentWrapper: {
    flex: 1, // Take full height
    justifyContent: 'space-around', // Distribute space between elements
    alignItems: 'center',
    paddingVertical: screenHeight * 0.03, // Responsive padding
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
    marginBottom: 20,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
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
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: '#292d31',
    marginBottom: 6,
    marginTop: 12,
    fontWeight: '500',
  },
  pickerContainer: {
    borderColor: '#D1D5DA',
    borderWidth: 1.5,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#F7F7F7',
  },
  picker: {
    height: 45,
    width: '100%',
    color: '#292d31',
  },
  pickerItem: {
    fontSize: 15,
    color: '#292d31',
  },
  input: {
    width: '100%', // Changed from '48%' to '100%' as parent column now manages width
    backgroundColor: '#F7F7F7',
    color: '#292d31',
    borderColor: '#D1D5DA',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 12,
    marginBottom: 0, // Removed bottom margin as spacing is handled by column or row
    fontSize: 15,
  },
  // New styles for side-by-side bottle inputs
  bottleInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12, // Margin after this row
  },
  bottleInputColumn: {
    flex: 1, // Each column takes equal space
    marginHorizontal: 5, // Small horizontal margin between columns
  },
  primaryButton: {
    backgroundColor: '#991930',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  navigationButtonsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 15,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 18,
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
    fontSize: 15,
    fontWeight: '600',
  },
});
