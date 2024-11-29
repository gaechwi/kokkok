import { useState } from "react";
import FriendTab from "@/components/FriendTab";
import { View, Text } from "react-native";

export default function Friend() {
  const [isFriendTap, setIsFriendTap] = useState(true);

  return (
    <View>
      <FriendTab
        isFriendTap={isFriendTap}
        handlePress={(newIsFriendTab: boolean) =>
          setIsFriendTap(newIsFriendTab)
        }
      />
      <View className="bg-white">
        <Text>Friend</Text>
      </View>
    </View>
  );
}
