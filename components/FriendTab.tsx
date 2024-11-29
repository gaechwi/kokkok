import { Text, TouchableOpacity, View } from "react-native";

interface FriendTapProps {
  isFriendTap: boolean;
  handlePress: (nIF: boolean) => void;
}

export default function FriendTab({
  isFriendTap,
  handlePress,
}: FriendTapProps) {
  return (
    <View className="w-full h-[64px] flex-row bg-white">
      <TouchableOpacity
        className={`flex-1 h-full justify-center items-center ${isFriendTap ? "border-b-2 border-primary" : "border-b-[1px] border-gray-20"}`}
        onPress={() => handlePress(true)}
      >
        <Text className={`title-2 ${isFriendTap ? "" : "font-pmedium"}`}>
          친구 목록
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 h-full justify-center items-center ${isFriendTap ? "border-b-[1px] border-gray-20" : "border-b-2 border-primary"}`}
        onPress={() => handlePress(false)}
      >
        <Text className={`title-2 ${isFriendTap ? "font-pmedium" : ""}`}>
          친구 요청
        </Text>
      </TouchableOpacity>
    </View>
  );
}
