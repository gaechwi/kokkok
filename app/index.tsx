import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Seoul",
    });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-3xl font-bold">여러분들 진짜 대단해요</Text>
      <Text className="text-3xl font-bold">{formatDate(new Date())}</Text>
      <StatusBar style="auto" />
    </View>
  );
}
