import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

type CurrentAffairsScreenProps = NativeStackScreenProps<RootStackParamList, "CurrentAffairs">;

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  relevanceScore: number;
  syllabusLinks: string[];
  tags: string[];
  signalStrength: 'low' | 'medium' | 'high';
}

interface SignalData {
  subject: string;
  frequency: number;
  trend: 'rising' | 'stable' | 'falling';
  importance: number;
}

export function CurrentAffairsScreen({ navigation }: CurrentAffairsScreenProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [signalData, setSignalData] = useState<SignalData[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentAffairs();
  }, []);

  const loadCurrentAffairs = async () => {
    try {
      setLoading(true);
      
      // This would typically fetch from Supabase or an external API
      // For now, we'll use mock data
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'India-China Border Talks Make Progress',
          summary: 'Latest developments in diplomatic relations between India and China with focus on border dispute resolution.',
          source: 'The Hindu',
          publishedAt: '2024-01-15T10:30:00Z',
          relevanceScore: 0.85,
          syllabusLinks: ['GS Paper II - International Relations', 'GS Paper III - Internal Security'],
          tags: ['China', 'Border', 'Diplomacy'],
          signalStrength: 'high'
        },
        {
          id: '2',
          title: 'Supreme Court Ruling on Electoral Bonds',
          summary: 'Constitutional bench delivers judgment on electoral bonds scheme and its implications for political funding.',
          source: 'Indian Express',
          publishedAt: '2024-01-14T14:20:00Z',
          relevanceScore: 0.78,
          syllabusLinks: ['GS Paper II - Polity', 'GS Paper II - Governance'],
          tags: ['Supreme Court', 'Electoral Bonds', 'Political Funding'],
          signalStrength: 'high'
        },
        {
          id: '3',
          title: 'Union Budget 2024 Highlights',
          summary: 'Key announcements and policy changes in the recent union budget affecting various sectors.',
          source: 'Economic Times',
          publishedAt: '2024-01-13T09:15:00Z',
          relevanceScore: 0.92,
          syllabusLinks: ['GS Paper III - Economy', 'GS Paper II - Governance'],
          tags: ['Budget', 'Economy', 'Policy'],
          signalStrength: 'high'
        }
      ];
      
      const mockSignals: SignalData[] = [
        { subject: 'Economy', frequency: 85, trend: 'rising', importance: 9 },
        { subject: 'Polity', frequency: 78, trend: 'stable', importance: 8 },
        { subject: 'Environment', frequency: 65, trend: 'rising', importance: 7 },
        { subject: 'International Relations', frequency: 72, trend: 'stable', importance: 8 },
        { subject: 'Science & Technology', frequency: 58, trend: 'falling', importance: 6 }
      ];
      
      setNewsItems(mockNews);
      setSignalData(mockSignals);
      
    } catch (error) {
      console.error('Error loading current affairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCurrentAffairs();
    setRefreshing(false);
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'stable': return '➡️';
      case 'falling': return '📉';
      default: return '❓';
    }
  };

  const filteredNews = newsItems.filter(item => {
    if (selectedFilter === 'all') return true;
    return item.signalStrength === selectedFilter;
  });

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity className="mb-4">
      <Card>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <Text className="font-bold text-lg text-gray-800 mb-2">{item.title}</Text>
            <Text className="text-gray-600 mb-2">{item.summary}</Text>
            
            <View className="flex-row items-center mb-2">
              <Text className="text-sm text-gray-500 mr-3">{item.source}</Text>
              <Text className="text-sm text-gray-500">
                {new Date(item.publishedAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View className="flex-row flex-wrap mb-2">
              {item.tags.map((tag, index) => (
                <View key={index} className="bg-blue-100 px-2 py-1 rounded-md mr-2 mb-1">
                  <Text className="text-blue-800 text-xs">#{tag}</Text>
                </View>
              ))}
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                Relevance: {Math.round(item.relevanceScore * 100)}%
              </Text>
              <View className={`w-3 h-3 rounded-full ${getSignalColor(item.signalStrength)}`} />
            </View>
          </View>
        </View>
        
        <View className="border-t border-gray-200 pt-3">
          <Text className="font-medium text-gray-800 mb-2">Syllabus Links:</Text>
          {item.syllabusLinks.map((link, index) => (
            <Text key={index} className="text-sm text-blue-600 mb-1">• {link}</Text>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderSignalItem = ({ item }: { item: SignalData }) => (
    <View className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-800">{item.subject}</Text>
        <Text className="text-lg">{getTrendIcon(item.trend)}</Text>
      </View>
      
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm text-gray-600">Frequency: {item.frequency}%</Text>
        <Text className="text-sm text-gray-600">Importance: {item.importance}/10</Text>
      </View>
      
      <View className="w-full bg-gray-200 rounded-full h-2">
        <View 
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${item.frequency}%` }}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading current affairs...</Text>
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
          <Text className="text-xl font-bold text-gray-800">Current Affairs</Text>
          <View className="w-12" />
        </View>
        <Text className="text-gray-600 mt-1">AI-curated news with UPSC relevance</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Signal Radar */}
        <Card className="mb-6">
          <Text className="font-bold text-lg text-gray-800 mb-4">📊 Signal Radar</Text>
          
          <FlatList
            data={signalData}
            renderItem={renderSignalItem}
            keyExtractor={(item) => item.subject}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
          
          <Text className="text-sm text-gray-600 mt-3 text-center">
            Topics with high frequency and importance are likely to appear in exams
          </Text>
        </Card>

        {/* Filter Buttons */}
        <View className="flex-row mb-4">
          {[
            { key: 'all', label: 'All', color: 'bg-gray-600' },
            { key: 'high', label: 'High Signal', color: 'bg-red-600' },
            { key: 'medium', label: 'Medium Signal', color: 'bg-yellow-600' },
            { key: 'low', label: 'Low Signal', color: 'bg-green-600' }
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setSelectedFilter(filter.key as any)}
              className={`flex-1 mr-2 py-2 px-3 rounded-md ${
                selectedFilter === filter.key ? filter.color : 'bg-gray-200'
              }`}
            >
              <Text className={`text-center text-sm font-medium ${
                selectedFilter === filter.key ? 'text-white' : 'text-gray-700'
              }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* News Items */}
        <Text className="font-bold text-xl text-gray-800 mb-4">Latest News</Text>
        
        {filteredNews.length === 0 ? (
          <Card>
            <Text className="text-center text-gray-600 py-8">
              No news items found for the selected filter.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={filteredNews}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {/* Generate Summary Button */}
        <View className="mt-6 mb-8">
          <Button className="w-full">
            📝 Generate Weekly Summary
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
