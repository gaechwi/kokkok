import { TextInput, View } from "react-native";

import icons from "@/constants/icons";

interface SearchBarProps {
  value: string;
  handleChangeText: (k: string) => void;
}

export default function SearchBar({ value, handleChangeText }: SearchBarProps) {
  return (
    <View className="w-full h-[56px] rounded-[10px] bg-gray-10 flex-row p-4 gap-4">
      <icons.SearchIcon width={24} height={24} />
      <TextInput
        value={value}
        onChangeText={(e) => handleChangeText(e)}
        // onSubmitEditing={() => {}} todo
        returnKeyType="search"
        placeholder="친구 검색"
        className="body-1 w-full placeholder:text-gray-45 text-gray-90"
      />
    </View>
  );
}
