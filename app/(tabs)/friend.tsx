import { useState } from "react";
import FriendTab from "@/components/FriendTab";
import { View, Text, ScrollView } from "react-native";
import SearchBar from "@/components/SearchBar";

export default function Friend() {
  const [isFriendTap, setIsFriendTap] = useState(true);
  const [keyword, setKeyword] = useState("");

  return (
    <View>
      <FriendTab
        isFriendTap={isFriendTap}
        handlePress={(newIsFriendTab: boolean) =>
          setIsFriendTap(newIsFriendTab)
        }
      />
      <ScrollView className="bg-white p-6 h-full w-full">
        <SearchBar
          value={keyword}
          handleChangeText={(newKeyword: string) => setKeyword(newKeyword)}
        />
        <Text>Friend</Text>
      </ScrollView>
    </View>
  );
}
