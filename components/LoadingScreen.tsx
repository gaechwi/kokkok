import colors from "@/constants/colors";
import { ActivityIndicator, View } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 bg-white justify-center items-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
