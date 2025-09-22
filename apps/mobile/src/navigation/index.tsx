import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LoginScreen } from "../screens/LoginScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SyllabusScreen } from "../screens/SyllabusScreen";
import { TutorScreen } from "../screens/TutorScreen";
import { CurrentAffairsScreen } from "../screens/CurrentAffairsScreen";
import { NotesScreen } from "../screens/NotesScreen";
import { TestsScreen } from "../screens/TestsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { AdminDashboardScreen } from "../screens/AdminDashboardScreen";

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Home: undefined;
  Syllabus: undefined;
  Tutor: undefined;
  CurrentAffairs: undefined;
  Notes: undefined;
  Tests: undefined;
  Profile: undefined;
  AdminDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  // Here you would normally implement logic to determine if the user is logged in
  const isLoggedIn = false;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Syllabus" component={SyllabusScreen} />
        <Stack.Screen name="Tutor" component={TutorScreen} />
        <Stack.Screen name="CurrentAffairs" component={CurrentAffairsScreen} />
        <Stack.Screen name="Notes" component={NotesScreen} />
        <Stack.Screen name="Tests" component={TestsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
