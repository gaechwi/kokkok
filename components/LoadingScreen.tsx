import colors from "@/constants/colors";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoadingScreen() {
  return (
    <SafeAreaView
      edges={[]}
      className="flex-1 bg-white justify-center items-center"
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </SafeAreaView>
  );
}
