import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Alert, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";

type AdminDashboardScreenProps = NativeStackScreenProps<RootStackParamList, "AdminDashboard">;

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'learner';
  subscription_status: string;
  created_at: string;
  query_count: number;
  last_active: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  payment_provider: string;
  amount: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'note' | 'podcast' | 'video' | 'test';
  status: 'pending' | 'approved' | 'rejected';
  author_id: string;
  created_at: string;
}

export function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'content' | 'analytics' | 'logs'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalLearners: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    pendingContent: 0,
    totalQueries: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;
      setSubscriptions(subsData || []);

      // Load content items (simplified)
      const { data: notesData } = await supabase
        .from('notes')
        .select('id, title, created_at, user_id, is_ai_generated')
        .eq('is_ai_generated', true)
        .limit(50);

      const { data: podcastsData } = await supabase
        .from('podcasts')
        .select('id, title, created_at')
        .limit(50);

      const { data: videosData } = await supabase
        .from('videos')
        .select('id, title, created_at')
        .limit(50);

      // Combine content items
      const content = [
        ...(notesData || []).map(item => ({ ...item, type: 'note' as const, status: 'approved' as const })),
        ...(podcastsData || []).map(item => ({ ...item, type: 'podcast' as const, status: 'approved' as const })),
        ...(videosData || []).map(item => ({ ...item, type: 'video' as const, status: 'approved' as const }))
      ];
      
      setContentItems(content);

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalAdmins = usersData?.filter(u => u.role === 'admin').length || 0;
      const totalLearners = totalUsers - totalAdmins;
      const activeSubscriptions = subsData?.filter(s => s.status === 'active').length || 0;
      const totalRevenue = subsData?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
      const pendingContent = content.filter(c => c.status === 'pending').length;
      const totalQueries = usersData?.reduce((sum, u) => sum + (u.query_count || 0), 0) || 0;

      setStats({
        totalUsers,
        totalAdmins,
        totalLearners,
        activeSubscriptions,
        totalRevenue,
        pendingContent,
        totalQueries
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'learner') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const updateSubscription = async (userId: string, planId: string, daysToAdd: number) => {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysToAdd);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          end_date: endDate.toISOString()
        });

      if (error) throw error;

      Alert.alert('Success', `Subscription extended by ${daysToAdd} days`);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  const resetUserQueries = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ query_count: 0 })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, query_count: 0 } : user
      ));

      Alert.alert('Success', 'User query count reset to 0');
    } catch (error) {
      console.error('Error resetting queries:', error);
      Alert.alert('Error', 'Failed to reset user queries');
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

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <Card className="flex-1 mx-2 p-4">
      <View className="items-center">
        <Text className="text-2xl mb-2">{icon}</Text>
        <Text className={`text-2xl font-bold mb-1 ${color}`}>{value}</Text>
        <Text className="text-sm text-gray-600 text-center">{title}</Text>
      </View>
    </Card>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <Card className="mb-3 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-bold text-gray-800">{item.full_name || item.email}</Text>
          <Text className="text-gray-600 text-sm">{item.email}</Text>
          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-1 rounded-md mr-2 ${
              item.role === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs font-medium ${
                item.role === 'admin' ? 'text-purple-800' : 'text-blue-800'
              }`}>
                {item.role}
              </Text>
            </View>
            <Text className="text-sm text-gray-600">
              Queries: {item.query_count || 0}
            </Text>
          </View>
        </View>
        
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => updateUserRole(item.id, item.role === 'admin' ? 'learner' : 'admin')}
            className="mr-2 px-3 py-1 bg-gray-200 rounded-md"
          >
            <Text className="text-xs font-medium">
              {item.role === 'admin' ? 'Demote' : 'Promote'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => resetUserQueries(item.id)}
            className="px-3 py-1 bg-green-200 rounded-md"
          >
            <Text className="text-xs font-medium">Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Admin Dashboard</Text>
          <TouchableOpacity onPress={signOut}>
            <Text className="text-red-600 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'overview', label: '📊 Overview', icon: '📊' },
            { key: 'users', label: '👥 Users', icon: '👥' },
            { key: 'subscriptions', label: '💎 Subscriptions', icon: '💎' },
            { key: 'content', label: '📝 Content', icon: '📝' },
            { key: 'analytics', label: '📈 Analytics', icon: '📈' },
            { key: 'logs', label: '📋 Logs', icon: '📋' }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as any)}
              className={`mr-3 px-4 py-2 rounded-lg ${
                activeTab === tab.key ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text className={`font-medium ${
                activeTab === tab.key ? 'text-white' : 'text-gray-700'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && (
          <View>
            {/* Stats Cards */}
            <View className="flex-row mb-6">
              {renderStatCard('Total Users', stats.totalUsers, '👥', 'text-blue-600')}
              {renderStatCard('Active Subs', stats.activeSubscriptions, '💎', 'text-green-600')}
            </View>
            
            <View className="flex-row mb-6">
              {renderStatCard('Total Revenue', `₹${stats.totalRevenue}`, '💰', 'text-yellow-600')}
              {renderStatCard('Total Queries', stats.totalQueries, '🔍', 'text-purple-600')}
            </View>

            {/* Recent Activity */}
            <Card className="mb-6">
              <Text className="font-bold text-lg text-gray-800 mb-4">📋 Recent Activity</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-green-600 mr-3">✅</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">New user registered</Text>
                    <Text className="text-sm text-gray-600">john@example.com</Text>
                  </View>
                  <Text className="text-sm text-gray-500">2 min ago</Text>
                </View>
                
                <View className="flex-row items-center py-2 border-b border-gray-200">
                  <Text className="text-blue-600 mr-3">💰</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">Subscription purchased</Text>
                    <Text className="text-sm text-gray-600">3 Months Plan - ₹999</Text>
                  </View>
                  <Text className="text-sm text-gray-500">15 min ago</Text>
                </View>
                
                <View className="flex-row items-center py-2">
                  <Text className="text-orange-600 mr-3">⚠️</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">Content flagged</Text>
                    <Text className="text-sm text-gray-600">AI-generated note requires review</Text>
                  </View>
                  <Text className="text-sm text-gray-500">1 hour ago</Text>
                </View>
              </View>
            </Card>

            {/* Quick Actions */}
            <View className="flex-row mb-6">
              <View className="flex-1 mr-2">
                <Button className="w-full">
                  📊 View Analytics
                </Button>
              </View>
              <View className="flex-1 ml-2">
                <Button variant="outline" className="w-full">
                  🚨 Moderation Queue
                </Button>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'users' && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">👥 User Management</Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2 bg-blue-100 p-3 rounded-lg">
                <Text className="text-blue-800 font-bold">{stats.totalLearners}</Text>
                <Text className="text-blue-600 text-sm">Learners</Text>
              </View>
              <View className="flex-1 ml-2 bg-purple-100 p-3 rounded-lg">
                <Text className="text-purple-800 font-bold">{stats.totalAdmins}</Text>
                <Text className="text-purple-600 text-sm">Admins</Text>
              </View>
            </View>

            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {activeTab === 'subscriptions' && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">💎 Subscription Management</Text>
            
            <View className="mb-4">
              <Text className="font-bold text-gray-800 mb-2">Available Plans:</Text>
              <View className="space-y-2">
                <Text className="text-sm text-gray-600">• Trial: 1 day, 10 queries</Text>
                <Text className="text-sm text-gray-600">• 1 Month: ₹499 + 18% GST, 75 queries</Text>
                <Text className="text-sm text-gray-600">• 3 Months: ₹999 + 18% GST, 150 queries</Text>
                <Text className="text-sm text-gray-600">• 6 Months: ₹1999 + 18% GST, 250 queries</Text>
                <Text className="text-sm text-gray-600">• 12 Months: ₹3999 + 18% GST, 400 queries</Text>
              </View>
            </View>

            <Text className="font-bold text-gray-800 mb-4">Active Subscriptions</Text>
            
            {subscriptions.filter(s => s.status === 'active').map((sub) => (
              <Card key={sub.id} className="mb-3 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{sub.plan_id}</Text>
                    <Text className="text-sm text-gray-600">
                      User: {sub.user_id.slice(0, 8)}...
                    </Text>
                    <Text className="text-sm text-gray-600">
                      Expires: {new Date(sub.end_date).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    onPress={() => updateSubscription(sub.user_id, sub.plan_id, 30)}
                    className="px-3 py-2 bg-green-200 rounded-md"
                  >
                    <Text className="text-xs font-medium text-green-800">Extend 30d</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'content' && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">📝 Content Management</Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2 bg-yellow-100 p-3 rounded-lg">
                <Text className="text-yellow-800 font-bold">{stats.pendingContent}</Text>
                <Text className="text-yellow-600 text-sm">Pending Review</Text>
              </View>
              <View className="flex-1 ml-2 bg-green-100 p-3 rounded-lg">
                <Text className="text-green-800 font-bold">{contentItems.length}</Text>
                <Text className="text-green-600 text-sm">Total Content</Text>
              </View>
            </View>

            <Text className="font-bold text-gray-800 mb-4">Recent Content</Text>
            
            {contentItems.slice(0, 10).map((item) => (
              <Card key={item.id} className="mb-3 p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">{item.title}</Text>
                    <Text className="text-sm text-gray-600 capitalize">{item.type}</Text>
                    <Text className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View className="flex-row">
                    <TouchableOpacity className="mr-2 px-3 py-1 bg-green-200 rounded-md">
                      <Text className="text-xs font-medium text-green-800">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-3 py-1 bg-red-200 rounded-md">
                      <Text className="text-xs font-medium text-red-800">Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'analytics' && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">📈 Analytics Dashboard</Text>
            
            <Card className="mb-6">
              <Text className="font-bold text-lg text-gray-800 mb-4">User Engagement</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Daily Active Users</Text>
                  <Text className="font-bold text-gray-800">1,247</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Monthly Active Users</Text>
                  <Text className="font-bold text-gray-800">8,932</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Average Session Time</Text>
                  <Text className="font-bold text-gray-800">24 min</Text>
                </View>
              </View>
            </Card>

            <Card className="mb-6">
              <Text className="font-bold text-lg text-gray-800 mb-4">Feature Usage</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">AI Tutor Queries</Text>
                  <Text className="font-bold text-gray-800">15,432</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Notes Generated</Text>
                  <Text className="font-bold text-gray-800">2,891</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Mock Tests Taken</Text>
                  <Text className="font-bold text-gray-800">1,203</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Podcasts Generated</Text>
                  <Text className="font-bold text-gray-800">456</Text>
                </View>
              </View>
            </Card>

            <Card>
              <Text className="font-bold text-lg text-gray-800 mb-4">Revenue Analytics</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Monthly Recurring Revenue</Text>
                  <Text className="font-bold text-green-600">₹127,450</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Annual Recurring Revenue</Text>
                  <Text className="font-bold text-green-600">₹1,529,400</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Churn Rate</Text>
                  <Text className="font-bold text-red-600">3.2%</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600">Average Revenue Per User</Text>
                  <Text className="font-bold text-gray-800">₹1,247</Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {activeTab === 'logs' && (
          <View>
            <Text className="text-xl font-bold text-gray-800 mb-4">📋 System Logs</Text>
            
            <Card className="mb-6">
              <Text className="font-bold text-lg text-gray-800 mb-4">Pipeline Execution Logs</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-start py-2 border-b border-gray-200">
                  <Text className="text-green-600 mr-3">✅</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">Content Ingestion Pipeline</Text>
                    <Text className="text-sm text-gray-600">Processed 25 documents, generated 150 embeddings</Text>
                    <Text className="text-xs text-gray-500">2 hours ago</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start py-2 border-b border-gray-200">
                  <Text className="text-green-600 mr-3">✅</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">Video Rendering Pipeline</Text>
                    <Text className="text-sm text-gray-600">Generated 3 educational videos, total 45 minutes</Text>
                    <Text className="text-xs text-gray-500">4 hours ago</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start py-2 border-b border-gray-200">
                  <Text className="text-blue-600 mr-3">🔄</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">EAS Build Pipeline</Text>
                    <Text className="text-sm text-gray-600">Building Android AAB, 85% complete</Text>
                    <Text className="text-xs text-gray-500">Running now</Text>
                  </View>
                </View>
                
                <View className="flex-row items-start py-2">
                  <Text className="text-red-600 mr-3">❌</Text>
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">Podcast Generation Pipeline</Text>
                    <Text className="text-sm text-red-600">Failed to process audio file - insufficient permissions</Text>
                    <Text className="text-xs text-gray-500">6 hours ago</Text>
                  </View>
                </View>
              </View>
            </Card>

            <Card>
              <Text className="font-bold text-lg text-gray-800 mb-4">API Usage Logs</Text>
              
              <View className="space-y-3">
                <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600">OpenAI API Calls</Text>
                  <Text className="font-bold text-gray-800">1,247</Text>
                </View>
                <View className="flex-row items-center justify-between py-2 border-b border-gray-200">
                  <Text className="text-gray-600">Hugging Face API Calls</Text>
                  <Text className="font-bold text-gray-800">892</Text>
                </View>
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-gray-600">Supabase Database Queries</Text>
                  <Text className="font-bold text-gray-800">15,432</Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

