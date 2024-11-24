import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-3xl font-bold">여러분들 진짜 대단해요</Text>
      <StatusBar style="auto" />
    </View>
  );
}
