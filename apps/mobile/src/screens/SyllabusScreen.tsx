import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabase";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

type SyllabusScreenProps = NativeStackScreenProps<RootStackParamList, "Syllabus">;

interface SyllabusNode {
  id: string;
  title: string;
  description: string | null;
  level: 'subject' | 'paper' | 'topic' | 'subtopic';
  order: number;
  parent_id: string | null;
  progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    confidence: number;
  };
}

export function SyllabusScreen({ navigation }: SyllabusScreenProps) {
  const [subjects, setSubjects] = useState<SyllabusNode[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SyllabusNode | null>(null);
  const [papers, setPapers] = useState<SyllabusNode[]>([]);
  const [topics, setTopics] = useState<SyllabusNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSyllabus();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadPapers(selectedSubject.id);
    } else {
      setPapers([]);
      setTopics([]);
    }
  }, [selectedSubject]);

  const loadSyllabus = async () => {
    try {
      setLoading(true);
      
      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('syllabus_nodes')
        .select('*')
        .eq('level', 'subject')
        .order('order');

      if (subjectsError) throw subjectsError;
      setSubjects(subjectsData || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading syllabus:', error);
      Alert.alert('Error', 'Failed to load syllabus data');
      setLoading(false);
    }
  };

  const loadPapers = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabus_nodes')
        .select('*')
        .eq('level', 'paper')
        .eq('parent_id', subjectId)
        .order('order');

      if (error) throw error;
      setPapers(data || []);
    } catch (error) {
      console.error('Error loading papers:', error);
      Alert.alert('Error', 'Failed to load papers');
    }
  };

  const loadTopics = async (paperId: string) => {
    try {
      const { data, error } = await supabase
        .from('syllabus_nodes')
        .select('*')
        .eq('level', 'topic')
        .eq('parent_id', paperId)
        .order('order');

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      Alert.alert('Error', 'Failed to load topics');
    }
  };

  const getProgressColor = (progress?: SyllabusNode['progress']) => {
    if (!progress) return 'bg-gray-300';
    
    switch (progress.status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'not_started': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getConfidenceWidth = (confidence: number) => {
    return `${Math.max(confidence * 100, 5)}%`;
  };

  const renderSubject = ({ item }: { item: SyllabusNode }) => (
    <TouchableOpacity
      onPress={() => setSelectedSubject(item)}
      className={`mb-3 p-4 rounded-lg border-2 ${
        selectedSubject?.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
          <Text className="text-gray-600 mt-1">{item.description}</Text>
        </View>
        
        {/* Progress Indicator */}
        <View className="ml-4">
          <View className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <View 
              className={`h-full ${getProgressColor(item.progress)}`}
              style={{ width: item.progress ? getConfidenceWidth(item.progress.confidence) : '5%' }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1 text-center">
            {item.progress ? `${Math.round(item.progress.confidence * 100)}%` : '0%'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPaper = ({ item }: { item: SyllabusNode }) => (
    <TouchableOpacity
      onPress={() => loadTopics(item.id)}
      className="mb-3 p-3 rounded-lg bg-white shadow-sm border border-gray-200"
    >
      <Text className="font-semibold text-gray-800">{item.title}</Text>
      <Text className="text-gray-600 text-sm mt-1">{item.description}</Text>
    </TouchableOpacity>
  );

  const renderTopic = ({ item }: { item: SyllabusNode }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Tutor', { syllabusNodeId: item.id })}
      className="mb-2 p-3 rounded-lg bg-gray-50 border border-gray-200"
    >
      <Text className="font-medium text-gray-800">{item.title}</Text>
      <Text className="text-gray-600 text-sm mt-1">{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading syllabus...</Text>
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
          <Text className="text-xl font-bold text-gray-800">3D Syllabus Map</Text>
          <View className="w-12" />
        </View>
        
        {/* Breadcrumb */}
        <View className="flex-row items-center mt-2">
          <Text className="text-gray-600">UPSC Syllabus</Text>
          {selectedSubject && (
            <>
              <Text className="text-gray-400 mx-2">→</Text>
              <Text className="text-blue-600 font-medium">{selectedSubject.title}</Text>
            </>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {!selectedSubject ? (
          // Subjects View
          <View>
            <Text className="text-2xl font-bold text-gray-800 mb-4">Select Subject</Text>
            <FlatList
              data={subjects}
              renderItem={renderSubject}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : papers.length === 0 ? (
          // Papers View
          <View>
            <TouchableOpacity 
              onPress={() => setSelectedSubject(null)}
              className="mb-4"
            >
              <Text className="text-blue-600">← Back to Subjects</Text>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800 mb-4">
              {selectedSubject.title} - Papers
            </Text>
            
            <Text className="text-gray-600 text-center py-8">
              No papers found for this subject.
            </Text>
          </View>
        ) : (
          // Topics View
          <View>
            <TouchableOpacity 
              onPress={() => setSelectedSubject(null)}
              className="mb-4"
            >
              <Text className="text-blue-600">← Back to Subjects</Text>
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800 mb-4">
              {selectedSubject.title} - Papers
            </Text>
            
            <FlatList
              data={papers}
              renderItem={renderPaper}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="mb-6"
            />
            
            {topics.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-3">Topics</Text>
                <FlatList
                  data={topics}
                  renderItem={renderTopic}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
