import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { supabase } from "../../lib/supabase";

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'learner' | 'admin'>('learner');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
              role: activeTab
            }
          }
        });

        if (error) throw error;
        
        Alert.alert(
          "Success",
          "Account created successfully! Please check your email for verification.",
          [
            {
              text: "OK",
              onPress: () => setIsSignUp(false)
            }
          ]
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        // Check user role and navigate accordingly
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user role:', userError);
          // Default to learner if role not found
          navigation.replace("Home");
          return;
        }

        if (userData.role === 'admin') {
          navigation.replace("AdminDashboard");
        } else {
          navigation.replace("Home");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert("Error", error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      
      Alert.alert("Success", "Password reset email sent!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-3xl font-bold text-center text-gray-800">
            UPSC AI Mentor
          </Text>
          <Text className="text-center text-gray-600 mt-2">
            Your AI-powered study companion
          </Text>
        </View>

        {/* Role Tabs */}
        <View className="flex-row bg-white mx-4 mt-6 rounded-lg shadow-sm">
          <TouchableOpacity
            onPress={() => setActiveTab('learner')}
            className={`flex-1 py-3 px-4 rounded-l-lg ${
              activeTab === 'learner' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'learner' ? 'text-white' : 'text-gray-700'
            }`}>
              📚 Learner
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('admin')}
            className={`flex-1 py-3 px-4 rounded-r-lg ${
              activeTab === 'admin' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-center font-medium ${
              activeTab === 'admin' ? 'text-white' : 'text-gray-700'
            }`}>
              ⚙️ Admin
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form */}
        <View className="px-4 py-6">
          <Card className="p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isSignUp ? 'Create Account' : 'Sign In'} as {activeTab === 'admin' ? 'Admin' : 'Learner'}
            </Text>
            
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="mb-4"
            />
            
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="mb-6"
            />
            
            <Button 
              onPress={handleAuth}
              loading={isLoading}
              className="w-full mb-4"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            
            {!isSignUp && (
              <TouchableOpacity onPress={resetPassword} className="mb-4">
                <Text className="text-blue-600 text-center font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-gray-600 text-center">
                {isSignUp ? 'Already have an account? Sign In' : 'New user? Create Account'}
              </Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Info Card */}
        <View className="px-4 pb-6">
          <Card className="p-4">
            <Text className="font-bold text-gray-800 mb-2">
              {activeTab === 'admin' ? 'Admin Access' : 'Learner Access'}
            </Text>
            <Text className="text-gray-600 text-sm">
              {activeTab === 'admin' 
                ? 'Full access to user management, content moderation, analytics, and system administration.'
                : 'Access to AI tutoring, study materials, mock tests, progress tracking, and personalized learning features.'
              }
            </Text>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
