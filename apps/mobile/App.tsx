import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <View className="flex-1 items-center justify-center bg-primary-50">
        <Text className="text-2xl font-bold text-primary-700">
          UPSC AI Mentor
        </Text>
        <Text className="text-lg text-primary-600 mt-2">
          Your AI-powered study companion
        </Text>
        <StatusBar style="auto" />
      </View>
    </SafeAreaProvider>
  );
}
