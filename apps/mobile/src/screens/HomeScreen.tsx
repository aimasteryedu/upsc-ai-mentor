import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

interface UserStats {
  queryCount: number;
  queryLimit: number;
  subscriptionStatus: string;
  subscriptionEndDate: string | null;
  daysRemaining: number;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    queryCount: 0,
    queryLimit: 10,
    subscriptionStatus: 'free',
    subscriptionEndDate: null,
    daysRemaining: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        let queryLimit = 10;
        if (subscription) {
          switch (subscription.plan_id) {
            case '1_month': queryLimit = 75; break;
            case '3_months': queryLimit = 150; break;
            case '6_months': queryLimit = 250; break;
            case '12_months': queryLimit = 400; break;
          }
        }

        let daysRemaining = 0;
        if (subscription?.end_date) {
          const endDate = new Date(subscription.end_date);
          const today = new Date();
          daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }

        setUserStats({
          queryCount: profile?.query_count || 0,
          queryLimit,
          subscriptionStatus: subscription?.status || 'trial',
          subscriptionEndDate: subscription?.end_date || null,
          daysRemaining
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
              navigation.replace("Login");
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const getSubscriptionBadge = () => {
    const { subscriptionStatus, daysRemaining } = userStats;
    
    if (subscriptionStatus === 'trial') {
      return { text: 'Trial', color: 'bg-blue-100 text-blue-800', icon: '🆓' };
    } else if (subscriptionStatus === 'active') {
      return { text: `Active (${daysRemaining}d)`, color: 'bg-green-100 text-green-800', icon: '💎' };
    } else {
      return { text: 'Expired', color: 'bg-red-100 text-red-800', icon: '⚠️' };
    }
  };

  const getQueryProgressColor = () => {
    const percentage = (userStats.queryCount / userStats.queryLimit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const badge = getSubscriptionBadge();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading your dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-gray-800">UPSC AI Mentor</Text>
            <View className={`ml-3 px-2 py-1 rounded-full ${badge.color}`}>
              <Text className="text-xs font-medium">{badge.icon} {badge.text}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Text className="text-gray-600">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Card className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-lg text-gray-800">Query Usage</Text>
            <Text className="text-sm text-gray-600">
              {userStats.queryCount} / {userStats.queryLimit}
            </Text>
          </View>
          
          <View className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <View 
              className={`h-3 rounded-full ${getQueryProgressColor()}`}
              style={{ width: `${Math.min((userStats.queryCount / userStats.queryLimit) * 100, 100)}%` }}
            />
          </View>
          
          <Text className="text-sm text-gray-600">
            {userStats.queryLimit - userStats.queryCount} queries remaining
          </Text>
        </Card>

        <Card className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-2">Welcome back, Aspirant! 🎯</Text>
          <Text className="text-gray-600 mb-3">
            Continue your UPSC preparation journey with AI-powered learning tools.
          </Text>
        </Card>

        <View className="flex-row mb-6">
          <View className="flex-1 mr-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Tutor')}
              className="bg-blue-600 p-4 rounded-lg items-center"
            >
              <Text className="text-white text-2xl mb-2">🤖</Text>
              <Text className="text-white font-medium">Ask AI Tutor</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 ml-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Tests')}
              className="bg-green-600 p-4 rounded-lg items-center"
            >
              <Text className="text-white text-2xl mb-2">📝</Text>
              <Text className="text-white font-medium">Take Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row mb-6">
          <View className="flex-1 mr-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notes')}
              className="bg-purple-600 p-4 rounded-lg items-center"
            >
              <Text className="text-white text-2xl mb-2">📚</Text>
              <Text className="text-white font-medium">Study Notes</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 ml-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate('CurrentAffairs')}
              className="bg-orange-600 p-4 rounded-lg items-center"
            >
              <Text className="text-white text-2xl mb-2">📰</Text>
              <Text className="text-white font-medium">Current Affairs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
