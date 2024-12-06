import { forwardRef } from "react";
import type {
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";
import { Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  placeholder?: string;
  mentionUser?: { username: string } | null;
  onSubmit?: () => void;
  isPending?: boolean;
}

const MentionInput = forwardRef<TextInput, MentionInputProps>(
  (
    {
      value,
      onChangeText,
      onKeyPress,
      placeholder,
      mentionUser,
      onSubmit,
      isPending,
    },
    ref,
  ) => {
    const mentionText = mentionUser ? `@${mentionUser.username} ` : "";

    const handleFocus = () => {
      if (ref && typeof ref === "object" && "current" in ref && ref.current) {
        ref.current.focus();
      }
    };

    return (
      <View className="flex-1 flex-row items-center">
        {/* 터치 가능한 영역 */}
        <TouchableWithoutFeedback onPress={handleFocus}>
          <View
            pointerEvents="box-only"
            className="h-[50px] w-full flex-1 flex-row items-center gap-2 rounded-[10px] border border-gray-20 px-[13px]"
          >
            {mentionText ? (
              <Text className="text-primary">{mentionText}</Text>
            ) : null}

            {value.trim() ? (
              <Text className="text-gray-90">{value}</Text>
            ) : (
              <Text className="text-gray-60">{placeholder}</Text>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* 숨겨진 TextInput */}
        <TextInput
          ref={ref}
          className="absolute top-0 left-0 h-0 w-0 opacity-0"
          autoCapitalize="none"
          keyboardType="default"
          textAlignVertical="center"
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          returnKeyType="send"
          onSubmitEditing={() => {
            if (value.trim() && !isPending && onSubmit) {
              onSubmit();
            }
          }}
        />
      </View>
    );
  },
);

export default MentionInput;
