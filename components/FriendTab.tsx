import { Text, TouchableOpacity, View } from "react-native";

interface FriendTabProps {
  isFriendTab: boolean;
  handlePress: () => void;
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
  isFriendTab,
  handlePress,
}: FriendTabProps) {
  return (
    <View className="w-full h-[64px] flex-row">
      <TabItem
        title="친구 목록"
        handlePress={handlePress}
        isActive={isFriendTab}
      />
      <TabItem
        title="친구 요청"
        handlePress={handlePress}
        isActive={!isFriendTab}
      />
    </View>
  );
}
