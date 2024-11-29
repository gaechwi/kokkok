import { Text, TouchableOpacity, View } from "react-native";

interface FriendTapProps {
  isFriendTap: boolean;
  handlePress: (nIF: boolean) => void;
}

interface TabItemProps {
  title: string;
  handlePress: () => void;
  isActive: boolean;
}

const TabItem = ({ title, handlePress, isActive }: TabItemProps) => (
  <TouchableOpacity
    className={`flex-1 h-full justify-center items-center ${isActive ? "border-b-2 border-primary" : "border-b-[1px] border-gray-20"}`}
    onPress={handlePress}
  >
    <Text className={`title-2 text-gray-90 ${isActive ? "" : "font-pmedium"}`}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function FriendTab({
  isFriendTap,
  handlePress,
}: FriendTapProps) {
  return (
    <View className="w-full h-[64px] flex-row bg-white">
      <TabItem
        title="친구 목록"
        handlePress={() => handlePress(true)}
        isActive={isFriendTap === true}
      />
      <TabItem
        title="친구 요청"
        handlePress={() => handlePress(false)}
        isActive={isFriendTap === false}
      />
    </View>
  );
}
