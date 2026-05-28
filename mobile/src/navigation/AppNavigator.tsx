import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';

import StepProviderScreen from '../screens/Onboarding/StepProviderScreen';
import StepApiKeyScreen from '../screens/Onboarding/StepApiKeyScreen';
import StepPrefsScreen from '../screens/Onboarding/StepPrefsScreen';
import PinScreen from '../screens/PinScreen';

import TeleprompterScreen from '../screens/TeleprompterScreen';
import ScriptBuilderScreen from '../screens/ScriptBuilderScreen';
import LiveQAScreen from '../screens/LiveQAScreen';
import SessionsScreen from '../screens/SessionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AISettingsScreen from '../screens/AISettingsScreen';

export type OnboardingStackParams = {
  StepProvider: undefined;
  StepApiKey: { providerId: string };
  StepPrefs: { providerId: string; model: string };
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParams>();
const Tab = createBottomTabNavigator();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="StepProvider" component={StepProviderScreen} />
      <OnboardingStack.Screen name="StepApiKey" component={StepApiKeyScreen} />
      <OnboardingStack.Screen name="StepPrefs" component={StepPrefsScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0d0d1a', borderTopColor: '#222' },
        tabBarActiveTintColor: '#7c6af7',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: { fontSize: 10 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Teleprompter: 'document-text-outline',
            Builder: 'sparkles-outline',
            LiveQA: 'mic-outline',
            Sessions: 'folder-outline',
            Profile: 'person-outline',
            Settings: 'settings-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Teleprompter" component={TeleprompterScreen} options={{ tabBarLabel: 'Prompter' }} />
      <Tab.Screen name="Builder" component={ScriptBuilderScreen} options={{ tabBarLabel: 'Builder' }} />
      <Tab.Screen name="LiveQA" component={LiveQAScreen} options={{ tabBarLabel: 'Live Q&A' }} />
      <Tab.Screen name="Sessions" component={SessionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={AISettingsScreen} options={{ tabBarLabel: 'AI' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useApp();

  if (!state.isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#080814' }}>
        <ActivityIndicator size="large" color="#7c6af7" />
      </View>
    );
  }

  if (state.pinEnabled && !state.pinUnlocked) {
    return (
      <NavigationContainer>
        <PinScreen mode="unlock" />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {state.isOnboarded ? <MainTabs /> : <OnboardingNavigator />}
    </NavigationContainer>
  );
}
