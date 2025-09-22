import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

type TutorScreenProps = NativeStackScreenProps<RootStackParamList, "Tutor">;

interface Question {
  id: string;
  question: string;
  answer?: string;
  timestamp: Date;
}

export function TutorScreen({ navigation, route }: TutorScreenProps) {
  const { syllabusNodeId } = route.params || {};
  
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentTopic, setCurrentTopic] = useState("General UPSC Query");

  useEffect(() => {
    if (syllabusNodeId) {
      loadTopicInfo();
    }
  }, [syllabusNodeId]);

  const loadTopicInfo = async () => {
    // Load topic information based on syllabusNodeId
    // This would integrate with the syllabus service
    setCurrentTopic("Selected Topic");
  };

  const askQuestion = async () => {
    if (!query.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    setIsLoading(true);
    
    try {
      // This would call the orchestrator Edge Function
      const response = await fetch('https://your-project.supabase.co/functions/v1/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-anon-key'
        },
        body: JSON.stringify({
          type: 'lesson',
          query: query.trim(),
          syllabusNodeId,
          parameters: {
            temperature: 0.7,
            maxTokens: 1024
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Add to questions history
      const newQuestion: Question = {
        id: Date.now().toString(),
        question: query.trim(),
        answer: data.result,
        timestamp: new Date()
      };
      
      setQuestions(prev => [newQuestion, ...prev]);
      setResponse(data.result);
      setQuery("");
      
    } catch (error) {
      console.error('Error asking question:', error);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePodcast = async () => {
    try {
      setIsLoading(true);
      
      // Call orchestrator for podcast script generation
      const response = await fetch('https://your-project.supabase.co/functions/v1/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-anon-key'
        },
        body: JSON.stringify({
          type: 'script',
          query: `Create a podcast script about: ${currentTopic}`,
          syllabusNodeId,
          parameters: {
            temperature: 0.7,
            maxTokens: 2048
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      Alert.alert('Success', 'Podcast script generated! Check your podcasts section.');
      
    } catch (error) {
      console.error('Error generating podcast:', error);
      Alert.alert('Error', 'Failed to generate podcast script.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateVideo = async () => {
    try {
      setIsLoading(true);
      
      // Call orchestrator for video script generation
      const response = await fetch('https://your-project.supabase.co/functions/v1/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-anon-key'
        },
        body: JSON.stringify({
          type: 'script',
          query: `Create a video lesson script about: ${currentTopic}`,
          syllabusNodeId,
          parameters: {
            temperature: 0.7,
            maxTokens: 2048
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      Alert.alert('Success', 'Video script generated! Check your videos section.');
      
    } catch (error) {
      console.error('Error generating video:', error);
      Alert.alert('Error', 'Failed to generate video script.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-blue-600 font-medium">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">AI Tutor</Text>
          <View className="w-12" />
        </View>
        <Text className="text-gray-600 mt-1">{currentTopic}</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Ask Question Section */}
        <Card className="mb-4">
          <Text className="font-bold text-lg text-gray-800 mb-3">Ask Your Question</Text>
          
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="What would you like to learn about?"
            multiline
            numberOfLines={3}
            className="border border-gray-300 rounded-md p-3 mb-3 text-gray-800"
            style={{ minHeight: 80 }}
          />
          
          <Button 
            onPress={askQuestion}
            loading={isLoading}
            className="w-full"
          >
            Ask AI Tutor
          </Button>
        </Card>

        {/* Quick Actions */}
        <View className="flex-row space-x-3 mb-4">
          <View className="flex-1">
            <Button 
              onPress={generatePodcast}
              variant="outline"
              loading={isLoading}
              className="w-full"
            >
              🎙️ Generate Podcast
            </Button>
          </View>
          <View className="flex-1">
            <Button 
              onPress={generateVideo}
              variant="outline"
              loading={isLoading}
              className="w-full"
            >
              🎬 Generate Video
            </Button>
          </View>
        </View>

        {/* Response Display */}
        {response && (
          <Card className="mb-4">
            <Text className="font-bold text-lg text-gray-800 mb-3">AI Response</Text>
            <Text className="text-gray-700 leading-6">{response}</Text>
          </Card>
        )}

        {/* Question History */}
        {questions.length > 0 && (
          <Card>
            <Text className="font-bold text-lg text-gray-800 mb-3">Question History</Text>
            {questions.map((q) => (
              <View key={q.id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                <Text className="font-medium text-gray-800 mb-2">Q: {q.question}</Text>
                <Text className="text-gray-600 text-sm mb-1">
                  {q.timestamp.toLocaleString()}
                </Text>
                {q.answer && (
                  <Text className="text-gray-700 mt-2">A: {q.answer}</Text>
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Help Text */}
        {!response && questions.length === 0 && (
          <Card className="mt-4">
            <Text className="font-bold text-lg text-gray-800 mb-3">How to Use AI Tutor</Text>
            <View className="space-y-2">
              <Text className="text-gray-700">• Ask specific questions about UPSC topics</Text>
              <Text className="text-gray-700">• Request explanations in simple language</Text>
              <Text className="text-gray-700">• Generate podcasts for audio learning</Text>
              <Text className="text-gray-700">• Create video lessons with animations</Text>
              <Text className="text-gray-700">• Get practice questions and answers</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
