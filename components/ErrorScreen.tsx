import Icons from "@/constants/icons";
import { Text, View } from "react-native";

const icons = {
  NOT_DONE: (size: number) => (
    <Icons.FaceNotDoneIcon width={size} height={size} />
  ),
  DONE: (size: number) => <Icons.FaceDoneIcon width={size} height={size} />,
} as const;
type IconType = keyof typeof icons;

export default function ErrorScreen({
  iconType = "NOT_DONE",
  iconSize = 56,
  errorMessage,
}: { iconType?: IconType; iconSize?: number; errorMessage: string }) {
  return (
    <View className="flex-1 bg-white justify-center items-center gap-[11px]">
      {icons[iconType](iconSize)}
      <Text className="title-3 text-gray-60">{errorMessage}</Text>
    </View>
  );
}
