import { Text, TouchableOpacity, View } from "react-native";
import CustomModal from "./Modal";
import icons from "@/constants/icons";
import colors from "@/constants/colors";

interface SetRestDayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SetRestDayModal({
  visible,
  onClose,
}: SetRestDayModalProps) {
  return (
    <CustomModal visible={visible} onClose={onClose} position="bottom">
      <View className="relative items-center px-[39px] pt-[40px] pb-[52px]">
        <icons.XIcon
          className="absolute top-[16px] right-[16px]"
          width={24}
          height={24}
          color={colors.gray[90]}
        />
        <Text className="heading-1">쉬는 날을 설정하세요.</Text>
        <Text>
          {"<"} 11월 {">"}
        </Text>
        <Text>일월화수목금토</Text>
        <Text>12</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>
        <Text>3456789</Text>

        <TouchableOpacity className="mt-[44px] h-[52px] w-[256px] items-center justify-center rounded-[10px] bg-primary">
          <Text className="title-2 text-white">완료</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}
