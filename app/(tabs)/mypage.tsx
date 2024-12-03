import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "@/constants/images";
import Icons from "@/constants/icons";
import colors from "@/constants/colors";
import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

export default function MyPage() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userData } = useQuery({
    queryKey: ["user", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user")
        .select("*")
        .eq("id", session?.user?.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <SafeAreaView edges={[]} className="flex-1 bg-white">
      <View className="w-full">
        <View className="mt-6 px-5">
          <View className="flex-row justify-between">
            <View className="flex-row items-center gap-6">
              <Image source={images.AvaTarDefault} className="size-[88px]" />
              <Text className="title-3">{userData?.username}</Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={async () => await supabase.auth.signOut()}
              >
                <Icons.MeatballIcon
                  height={24}
                  width={24}
                  color={colors.gray[70]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-4 rounded-[10px] bg-[#f0f0f0] p-4">
            <Text className="body-5 text-gray-80">
              소개글 입니다{"\n"}소개글입니다
            </Text>
          </View>
        </View>

        <FlatList
          data={[
            {
              url: "https://cdn.pixabay.com/photo/2023/02/08/06/29/fashion-7775824_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2023/02/16/03/43/music-player-7792956_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2016/09/10/11/11/musician-1658887_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2020/10/30/09/24/angel-5698069_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            },
            {
              url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            },
            // {
            //   url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            // },
            // {
            //   url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            // },
            // {
            //   url: "https://cdn.pixabay.com/photo/2015/03/27/13/16/maine-coon-694730_1280.jpg",
            // },
          ]}
          renderItem={({ item }) => {
            const size = Dimensions.get("window").width / 3;
            return (
              <View style={{ height: size, width: size }} className="bg-gray-5">
                <Image
                  source={{ uri: item.url }}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            );
          }}
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
          className="mt-[32px]"
        />
      </View>
    </SafeAreaView>
  );
}
