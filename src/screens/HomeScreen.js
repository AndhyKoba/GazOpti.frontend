import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';


export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <Text style={styles.title}>GazOpti.</Text>
      </View>
      <View style={styles.container3}>
          <Text style={styles.title2}>Connectez-vous</Text>
          <Text style={styles.subtitle}>Saissisez vos informations personnelles afin de vous connecter</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LoginController')}
          >
            <Icon name="arrowright" size={24} color="#f0f2f7" />
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292d31',
  },
  container2: {
    height: '55%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#991930',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  container3: {
    height: '45%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#f0f2f7',
    marginBottom: 10,
  },
  title2: {
    fontSize: 26,
    color: '#f0f2f7',
    marginBottom: 5,
    fontWeight: 'semi-bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#dcdcdc',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: -15,
  },
  button: {
    boxShadow: '0px 4px 4px rgba(238, 9, 9, 0.63)',
    backgroundColor: '#991930',
    width: 80,
    height: 80,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});