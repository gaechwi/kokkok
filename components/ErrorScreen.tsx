import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ErrorScreen({
  errorMessage,
}: { errorMessage: string }) {
  return (
    <SafeAreaView
      edges={[]}
      className="flex-1 bg-white justify-center items-center"
    >
      <Text className="title-1">{errorMessage}</Text>
    </SafeAreaView>
  );
}
