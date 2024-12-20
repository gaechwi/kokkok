import type { UserProfile } from "@/types/User.interface";
import { useState } from "react";
import { FlatList, type ListRenderItemInfo, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "./SearchBar";

interface SearchLayoutProps {
  data: UserProfile[]; // 추후 검색 사용 범위 넓어지면 변경 가능
  onChangeKeyword: (newKeyword: string) => void;
  renderItem: (itemInfo: ListRenderItemInfo<UserProfile>) => React.ReactElement;
  emptyComponent: React.ReactElement;
}

export function SearchLayout<T>({
  data,
  onChangeKeyword,
  renderItem,
  emptyComponent,
}: SearchLayoutProps) {
  const [keyword, setKeyword] = useState("");

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <FlatList
        data={data}
        keyExtractor={(elem) => elem.id}
        renderItem={renderItem}
        className="w-full grow px-6"
        contentContainerStyle={data.length ? {} : { flex: 1 }}
        ListHeaderComponent={
          <SearchBar
            value={keyword}
            customClassName="mt-6 mb-2"
            handleChangeText={(newKeyword: string) => {
              setKeyword(newKeyword);
              onChangeKeyword(newKeyword);
            }}
          />
        }
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  );
}
