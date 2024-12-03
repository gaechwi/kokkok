import { Text, View } from "react-native";

export default function ErrorScreen({
  errorMessage,
}: { errorMessage: string }) {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Text className="title-1">{errorMessage}</Text>
    </View>
  );
}
