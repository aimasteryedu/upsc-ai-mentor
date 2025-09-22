import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "../../lib/supabase";

import { RootStackParamList } from "../../navigation";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";

type NotesScreenProps = NativeStackScreenProps<RootStackParamList, "Notes">;

interface Note {
  id: string;
  title: string;
  content: string;
  syllabus_node_id: string | null;
  is_ai_generated: boolean;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export function NotesScreen({ navigation }: NotesScreenProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ai' | 'manual'>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchQuery, selectedFilter]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      
      // Load user's notes from Supabase
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
      
    } catch (error) {
      console.error('Error loading notes:', error);
      Alert.alert('Error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(note =>
        selectedFilter === 'ai' ? note.is_ai_generated : !note.is_ai_generated
      );
    }

    setFilteredNotes(filtered);
  };

  const generateAINotes = async () => {
    const topic = await new Promise<string>((resolve) => {
      Alert.prompt(
        "Generate AI Notes",
        "Enter the topic you want notes for:",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Generate", onPress: (value) => resolve(value || "") }
        ]
      );
    });

    if (!topic.trim()) return;

    setIsGenerating(true);
    
    try {
      // Call orchestrator to generate notes
      const response = await fetch('https://your-project.supabase.co/functions/v1/orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer your-anon-key'
        },
        body: JSON.stringify({
          type: 'notes',
          query: `Create comprehensive notes on: ${topic}`,
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

      // Save the generated notes
      const { data: savedNote, error: saveError } = await supabase
        .from('notes')
        .insert({
          title: `AI Notes: ${topic}`,
          content: data.result,
          is_ai_generated: true
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Add to local state
      setNotes(prev => [savedNote, ...prev]);
      
      Alert.alert('Success', 'AI notes generated and saved!');
      
    } catch (error) {
      console.error('Error generating AI notes:', error);
      Alert.alert('Error', 'Failed to generate notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', noteId);

              if (error) throw error;

              setNotes(prev => prev.filter(note => note.id !== noteId));
              Alert.alert('Success', 'Note deleted successfully');
              
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Tutor', { syllabusNodeId: item.syllabus_node_id })}
      onLongPress={() => deleteNote(item.id)}
      className="mb-4"
    >
      <Card>
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="font-bold text-lg text-gray-800 flex-1">{item.title}</Text>
              {item.is_ai_generated && (
                <View className="bg-blue-100 px-2 py-1 rounded-md ml-2">
                  <Text className="text-blue-800 text-xs">🤖 AI</Text>
                </View>
              )}
            </View>
            
            <Text className="text-gray-600 mb-2" numberOfLines={3}>
              {item.content}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-500">
                {new Date(item.updated_at).toLocaleDateString()}
              </Text>
              {item.source_url && (
                <Text className="text-sm text-blue-600">🔗 Source</Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading notes...</Text>
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
          <Text className="text-xl font-bold text-gray-800">Smart Notes</Text>
          <View className="w-12" />
        </View>
        <Text className="text-gray-600 mt-1">AI-powered note generation and management</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* Search and Filter */}
        <View className="mb-4">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes..."
            className="border border-gray-300 rounded-md px-4 py-3 mb-3 text-gray-800"
          />
          
          <View className="flex-row mb-4">
            {[
              { key: 'all', label: 'All Notes' },
              { key: 'ai', label: 'AI Generated' },
              { key: 'manual', label: 'Manual' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedFilter(filter.key as any)}
                className={`flex-1 mr-2 py-2 px-3 rounded-md ${
                  selectedFilter === filter.key ? 'bg-blue-600' : 'bg-gray-200'
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
        </View>

        {/* Generate AI Notes Button */}
        <View className="mb-6">
          <Button 
            onPress={generateAINotes}
            loading={isGenerating}
            className="w-full"
          >
            🤖 Generate AI Notes
          </Button>
        </View>

        {/* Notes List */}
        <Text className="font-bold text-xl text-gray-800 mb-4">Your Notes</Text>
        
        {filteredNotes.length === 0 ? (
          <Card>
            <Text className="text-center text-gray-600 py-8">
              {searchQuery || selectedFilter !== 'all' 
                ? 'No notes found matching your criteria.'
                : 'No notes yet. Generate AI notes or create manual notes to get started.'
              }
            </Text>
          </Card>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNote}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}

        {/* Help Text */}
        <Card className="mt-6">
          <Text className="font-bold text-lg text-gray-800 mb-3">Note Features</Text>
          <View className="space-y-2">
            <Text className="text-gray-700">• 🤖 AI-generated notes with citations</Text>
            <Text className="text-gray-700">• 🔍 Smart search across all content</Text>
            <Text className="text-gray-700">• 📝 Evidence-first note builder</Text>
            <Text className="text-gray-700">• 🔗 Source linking and verification</Text>
            <Text className="text-gray-700">• 📱 Offline access to downloaded notes</Text>
          </View>
          
          <Text className="text-sm text-gray-500 mt-3">
            Long press on any note to delete it.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
