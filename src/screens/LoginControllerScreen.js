import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importation nécessaire pour AsyncStorage

export default function LoginControllerScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // État pour gérer l'indicateur de chargement du bouton

  const handleLogin = async () => {
    setLoading(true); // Active l'indicateur de chargement
    try {
      const response = await fetch('http://31.97.55.154:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Tente de récupérer un message d'erreur plus spécifique du corps de la réponse
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants invalides');
      }

      const data = await response.json();
      const token = data.token; // Supposons que l'API renvoie le token directement sous 'data.token'
      const userRole = data.role; // Supposons que l'API renvoie le rôle directement sous 'data.role'

      // Vérification du rôle du conducteur
      if (userRole === 'driver') {
        Alert.alert('Erreur', 'Impossible de se connecter en tant que conducteur pour l\'instant.');
        setLoading(false); // Désactive l'indicateur de chargement
        return; // Arrête l'exécution si c'est un conducteur
      }

      // --- POINT CRUCIAL: Sauvegarde du token dans AsyncStorage ---
      if (token) {
        await AsyncStorage.setItem('token', token); // Sauvegarde le token
        console.log('Token saved to AsyncStorage successfully!');
      } else {
        // Gère le cas où la connexion réussit mais aucun token n'est retourné par le backend
        Alert.alert('Erreur', 'Connexion réussie, mais aucun jeton d\'authentification n\'a été reçu.');
        console.warn('Login successful, but no token received from API.');
        setLoading(false); // Désactive l'indicateur de chargement
        return;
      }

      Alert.alert('Succès', 'Connexion réussie !'); // Alerte de confirmation facultative
      navigation.navigate('CreateDelivery'); // Navigue vers l'écran de création de livraison après succès

    } catch (error) {
      console.error("Login error:", error); // Log l'erreur complète pour le débogage
      Alert.alert('Erreur', error.message || 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false); // Assure que l'indicateur de chargement est désactivé, peu importe le résultat
    }
  };

  return (
    <LinearGradient
      colors={['#f0f2f7', '#f9f9f7']}
      style={styles.container}
    >
      <Text style={styles.logo}>GazOpti.</Text>
      <Text style={styles.title}>Connexion</Text>
      <View style={styles.container2}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7B7C7B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#7B7C7B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading} // Désactive le bouton pendant le chargement
        >
          {loading ? (
            <ActivityIndicator color="#f0f2f7" /> // Affiche l'indicateur de chargement
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text> // Texte normal du bouton
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  container2: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#292d31',
  },
  logo: {
    fontSize: 20,
    color: '#991930',
    marginBottom: 5,
    fontWeight: 'bold',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#f0f2f7',
    color: '#292d31',
    borderColor: '#292d31',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 12,
    marginBottom: 24,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#991930',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 24,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#490815',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#f0f2f7',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
