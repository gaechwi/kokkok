import Icons from "@/constants/icons";
import { Text, View } from "react-native";
import type { BaseToastProps, ToastType } from "react-native-toast-message";
import Toast from "react-native-toast-message";

export const ToastConfig = {
  success: (props: BaseToastProps) => (
    <View className="z-10 rounded-[10px] bg-gray-60 p-4">
      <Text className="title-4 text-white ">{props.text1}</Text>
    </View>
  ),
  fail: (props: BaseToastProps) => (
    <View className="z-10 flex-row items-center gap-4 rounded-[10px] bg-gray-60 p-4">
      <Icons.FaceNotDoneIcon width={24} height={24} />
      <Text className="title-4 text-white">{props.text1}</Text>
    </View>
  ),
};

export const showToast = (type: ToastType, text1: string) => {
  Toast.show({
    type,
    text1,
    visibilityTime: 1000,
    topOffset: 90,
  });
};
