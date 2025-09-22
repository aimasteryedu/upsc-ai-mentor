import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'learner';
  subscription_status: string;
  subscription_end_date: string | null;
  query_count: number;
  created_at: string;
}

const plans = [
  { id: '1_month', name: '1 Month', price: 499, gst: 89.82, queries: 75 },
  { id: '3_months', name: '3 Months', price: 999, gst: 179.82, queries: 150 },
  { id: '6_months', name: '6 Months', price: 1999, gst: 359.82, queries: 250 },
  { id: '12_months', name: '12 Months', price: 3999, gst: 719.82, queries: 400 }
];

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        setUser(profile);

        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('status', 'active')
          .single();

        setCurrentSubscription(subscription);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const upgradeSubscription = async (plan: any) => {
    Alert.alert(
      'Upgrade Subscription',
      `Upgrade to ${plan.name} plan?\n\nPrice: ₹${plan.price} + GST ₹${plan.gst}\nTotal: ₹${plan.price + plan.gst}\nQueries: ${plan.queries}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + (plan.id === '1_month' ? 30 : plan.id === '3_months' ? 90 : plan.id === '6_months' ? 180 : 365));

              const { error } = await supabase
                .from('subscriptions')
                .insert({
                  user_id: user?.id,
                  plan_id: plan.id,
                  status: 'active',
                  end_date: endDate.toISOString(),
                  amount: plan.price + plan.gst
                });

              if (error) throw error;

              Alert.alert('Success', `Successfully upgraded to ${plan.name} plan!`);
              loadUserProfile();
            } catch (error) {
              console.error('Error upgrading subscription:', error);
              Alert.alert('Error', 'Failed to upgrade subscription');
            }
          }
        }
      ]
    );
  };

  const getCurrentPlan = () => {
    if (currentSubscription) {
      return plans.find(p => p.id === currentSubscription.plan_id);
    }
    return { name: 'Free Trial', queries: 10 };
  };

  const getQueryLimit = () => {
    const plan = getCurrentPlan();
    return plan?.queries || 10;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const currentPlan = getCurrentPlan();
  const queryLimit = getQueryLimit();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">My Profile</Text>
          <View className="w-12" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <Card className="mb-6">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-3">
              <Text className="text-3xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800">
              {user.full_name || user.email}
            </Text>
            <Text className="text-gray-600">{user.email}</Text>
            
            <View className="bg-blue-100 px-3 py-1 rounded-full mt-2">
              <Text className="text-blue-800 text-sm font-medium">
                {currentPlan?.name || 'Free Trial'}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="mb-6">
          <Text className="font-bold text-lg text-gray-800 mb-3">Query Usage</Text>
          
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-gray-600">Used</Text>
            <Text className="font-medium text-gray-800">
              {user.query_count} / {queryLimit}
            </Text>
          </View>
          
          <View className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <View 
              className="bg-green-500 h-3 rounded-full"
              style={{ width: `${Math.min((user.query_count / queryLimit) * 100, 100)}%` }}
            />
          </View>
          
          <Text className="text-sm text-gray-600">
            {queryLimit - user.query_count} queries remaining
          </Text>
        </Card>

        <Card className="mb-6">
          <Text className="font-bold text-lg text-gray-800 mb-4">Upgrade Plans</Text>
          
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => upgradeSubscription(plan)}
              className="border border-gray-200 rounded-lg p-4 mb-3"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-bold text-gray-800">{plan.name}</Text>
                <Text className="font-bold text-blue-600">
                  ₹{plan.price + plan.gst}
                </Text>
              </View>
              
              <Text className="text-gray-600 text-sm mb-2">
                {plan.queries} queries • {plan.id === '1_month' ? '30' : plan.id === '3_months' ? '90' : plan.id === '6_months' ? '180' : '365'} days
              </Text>
              
              <Text className="text-blue-600 text-sm font-medium">Select Plan</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
