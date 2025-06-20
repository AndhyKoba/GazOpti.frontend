import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // Importez createStackNavigator

// Importez vos écrans
import LoginControllerScreen from './src/screens/LoginControllerScreen'; // Assurez-vous que les chemins sont corrects
import CreateDeliveryScreen from './src/screens/CreateDeliveryScreen';
import SeeDeliveryScreen from './src/screens/SeeDeliveryScreen';
import EditDeliveryScreen from './src/screens/EditDeliveryScreen';
// Si vous avez un écran 'Home', importez-le ici
import HomeScreen from './src/screens/HomeScreen';

const Stack = createStackNavigator(); // Utilisez Stack Navigator

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="LoginController"
          component={LoginControllerScreen}
          options={{ headerShown: false }} // Pas de header pour l'écran de connexion
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
          
        /> 
        <Stack.Screen
          name="CreateDelivery"
          component={CreateDeliveryScreen}
          options={{ headerShown: false }} // Titre du header pour CreateDelivery
        />
        <Stack.Screen
          name="SeeDelivery"
          component={SeeDeliveryScreen}
          options={{ title: 'Voir les Livraisons' }} // Titre du header pour SeeDelivery
        />
        <Stack.Screen
          name="EditDelivery"
          component={EditDeliveryScreen}
          options={{ title: 'Modifier une Livraison' }} // Titre du header pour EditDelivery
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;