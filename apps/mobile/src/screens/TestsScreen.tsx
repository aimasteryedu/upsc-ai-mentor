import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabase";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

type TestsScreenProps = NativeStackScreenProps<RootStackParamList, "Tests">;

interface Test {
  id: string;
  title: string;
  description: string;
  test_type: 'prelims' | 'mains' | 'personality';
  duration: number;
  total_marks: number;
  passing_marks: number;
  is_public: boolean;
  created_at: string;
}

interface TestAttempt {
  id: string;
  test_id: string;
  score: number | null;
  max_score: number;
  answers: any;
  start_time: string;
  end_time: string | null;
}

export function TestsScreen({ navigation }: TestsScreenProps) {
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'prelims' | 'mains' | 'personality'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
    loadAttempts();
  }, []);

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
      Alert.alert('Error', 'Failed to load tests');
    }
  };

  const loadAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setAttempts(data || []);
    } catch (error) {
      console.error('Error loading attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (test: Test) => {
    Alert.alert(
      "Start Test",
      `Are you ready to start "${test.title}"?\n\nDuration: ${Math.floor(test.duration / 60)} minutes\nTotal Marks: ${test.total_marks}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: async () => {
            try {
              // Create test attempt record
              const { data, error } = await supabase
                .from('test_attempts')
                .insert({
                  test_id: test.id,
                  max_score: test.total_marks
                })
                .select()
                .single();

              if (error) throw error;

              // Navigate to test taking screen (would be implemented)
              Alert.alert('Test Started', `Your attempt ID: ${data.id}\n\nTest interface would open here.`);
              
            } catch (error) {
              console.error('Error starting test:', error);
              Alert.alert('Error', 'Failed to start test');
            }
          }
        }
      ]
    );
  };

  const generateCustomTest = async () => {
    const subject = await new Promise<string>((resolve) => {
      Alert.prompt(
        "Custom Test",
        "Enter subject (e.g., History, Polity, Economy):",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Generate", onPress: (value) => resolve(value || "") }
        ]
      );
    });

    if (!subject.trim()) return;

    const difficulty = await new Promise<string>((resolve) => {
      Alert.alert(
        "Difficulty Level",
        "Select difficulty:",
        [
          { text: "Easy", onPress: () => resolve("easy") },
          { text: "Medium", onPress: () => resolve("medium") },
          { text: "Hard", onPress: () => resolve("hard") },
          { text: "Cancel", style: "cancel", onPress: () => resolve("") }
        ]
      );
    });

    if (!difficulty) return;

    Alert.alert('Generating Test', `Creating ${difficulty} level test for ${subject}...\n\nThis feature would generate a custom test with AI-curated questions.`);
  };

  const getTestTypeColor = (type: string) => {
    switch (type) {
      case 'prelims': return 'bg-green-100 text-green-800';
      case 'mains': return 'bg-blue-100 text-blue-800';
      case 'personality': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'prelims': return '📝';
      case 'mains': return '📚';
      case 'personality': return '🧠';
      default: return '❓';
    }
  };

  const getAttemptStatus = (attempt: TestAttempt) => {
    if (attempt.end_time) {
      return attempt.score !== null 
        ? `Score: ${attempt.score}/${attempt.max_score}`
        : 'Completed';
    }
    return 'In Progress';
  };

  const filteredTests = tests.filter(test => {
    if (selectedCategory === 'all') return true;
    return test.test_type === selectedCategory;
  });

  const renderTest = ({ item }: { item: Test }) => {
    const attempt = attempts.find(a => a.test_id === item.id && !a.end_time);
    
    return (
      <TouchableOpacity onPress={() => startTest(item)} className="mb-4">
        <Card>
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">{getTestTypeIcon(item.test_type)}</Text>
                <Text className="font-bold text-lg text-gray-800 flex-1">{item.title}</Text>
              </View>
              
              <Text className="text-gray-600 mb-3">{item.description}</Text>
              
              <View className="flex-row items-center mb-2">
                <View className={`px-2 py-1 rounded-md mr-2 ${getTestTypeColor(item.test_type)}`}>
                  <Text className="text-xs font-medium capitalize">{item.test_type}</Text>
                </View>
                <Text className="text-sm text-gray-600">
                  ⏱️ {Math.floor(item.duration / 60)} min
                </Text>
                <Text className="text-sm text-gray-600 ml-3">
                  🎯 {item.total_marks} marks
                </Text>
              </View>
              
              {attempt && (
                <View className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
                  <Text className="text-yellow-800 text-sm font-medium">
                    📝 {getAttemptStatus(attempt)}
                  </Text>
                </View>
              )}
              
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">
                  Passing: {item.passing_marks} marks
                </Text>
                <Button 
                  onPress={() => startTest(item)}
                  size="sm"
                  className="px-4"
                >
                  {attempt ? 'Resume' : 'Start Test'}
                </Button>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderAttempt = ({ item }: { item: TestAttempt }) => {
    const test = tests.find(t => t.id === item.test_id);
    
    return (
      <View className="mb-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-medium text-gray-800">
            {test?.title || 'Unknown Test'}
          </Text>
          <Text className={`text-sm px-2 py-1 rounded-md ${
            item.end_time ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {item.end_time ? 'Completed' : 'In Progress'}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm text-gray-600">
            Started: {new Date(item.start_time).toLocaleDateString()}
          </Text>
          {item.score !== null && (
            <Text className="text-sm font-medium text-gray-800">
              Score: {item.score}/{item.max_score}
            </Text>
          )}
        </View>
        
        {item.end_time && (
          <View className="w-full bg-gray-200 rounded-full h-2">
            <View 
              className={`h-2 rounded-full ${
                item.score && item.score >= (test?.passing_marks || 0) ? 'bg-green-600' : 'bg-red-600'
              }`}
              style={{ width: item.score ? `${(item.score / item.max_score) * 100}%` : '0%' }}
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading tests...</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Practice Tests</Text>
          <View className="w-12" />
        </View>
        <Text className="text-gray-600 mt-1">Mock tests and question banks</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Category Filter */}
        <View className="flex-row mb-4">
          {[
            { key: 'all', label: 'All Tests', icon: '📋' },
            { key: 'prelims', label: 'Prelims', icon: '📝' },
            { key: 'mains', label: 'Mains', icon: '📚' },
            { key: 'personality', label: 'Personality', icon: '🧠' }
          ].map((category) => (
            <TouchableOpacity
              key={category.key}
              onPress={() => setSelectedCategory(category.key as any)}
              className={`flex-1 mr-2 py-3 px-2 rounded-lg items-center ${
                selectedCategory === category.key ? 'bg-blue-600' : 'bg-white border border-gray-200'
              }`}
            >
              <Text className="text-lg mb-1">{category.icon}</Text>
              <Text className={`text-center text-sm font-medium ${
                selectedCategory === category.key ? 'text-white' : 'text-gray-700'
              }`}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Custom Test */}
        <View className="mb-6">
          <Button 
            onPress={generateCustomTest}
            variant="outline"
            className="w-full"
          >
            🎯 Generate Custom Test
          </Button>
        </View>

        {/* Available Tests */}
        <Text className="font-bold text-xl text-gray-800 mb-4">Available Tests</Text>
        
        {filteredTests.length === 0 ? (
          <Card>
            <Text className="text-center text-gray-600 py-8">
              No tests found for the selected category.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={filteredTests}
            renderItem={renderTest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            className="mb-6"
          />
        )}

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <View>
            <Text className="font-bold text-xl text-gray-800 mb-4">Recent Attempts</Text>
            <FlatList
              data={attempts.slice(0, 5)}
              renderItem={renderAttempt}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Test Statistics */}
        <Card className="mt-6">
          <Text className="font-bold text-lg text-gray-800 mb-4">📊 Your Progress</Text>
          
          <View className="grid grid-cols-2 gap-4">
            <View className="text-center">
              <Text className="text-2xl font-bold text-blue-600">{tests.length}</Text>
              <Text className="text-sm text-gray-600">Tests Available</Text>
            </View>
            <View className="text-center">
              <Text className="text-2xl font-bold text-green-600">
                {attempts.filter(a => a.end_time && a.score && a.score >= 40).length}
              </Text>
              <Text className="text-sm text-gray-600">Tests Passed</Text>
            </View>
          </View>
          
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="font-medium text-gray-800 mb-2">Recent Performance</Text>
            <Text className="text-sm text-gray-600">
              Average Score: {
                attempts.length > 0 
                  ? Math.round(attempts.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / attempts.filter(a => a.score).length)
                  : 0
              }%
            </Text>
          </View>
        </Card>

        {/* Help Card */}
        <Card className="mt-6">
          <Text className="font-bold text-lg text-gray-800 mb-3">Test Features</Text>
          <View className="space-y-2">
            <Text className="text-gray-700">• 📝 Prelims: MCQ-based with negative marking</Text>
            <Text className="text-gray-700">• 📚 Mains: Descriptive answers with evaluation</Text>
            <Text className="text-gray-700">• 🧠 Personality: Interview simulation</Text>
            <Text className="text-gray-700">• 📊 Analytics: Performance tracking and insights</Text>
            <Text className="text-gray-700">• 🎯 Adaptive: Difficulty adjusts based on performance</Text>
            <Text className="text-gray-700">• ⏰ Timer: Realistic exam conditions</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
