import Icons from "@/constants/icons";
import { Text, View } from "react-native";

export default function ErrorScreen({
  errorMessage,
}: { errorMessage: string }) {
  return (
    <View className="flex-1 bg-white justify-center items-center gap-[11px]">
      <Icons.FaceNotDoneIcon width={56} height={56} />
      <Text className="title-3 text-gray-60">{errorMessage}</Text>
    </View>
  );
}
