import { forwardRef } from "react";
import { Text, TextInput, View } from "react-native";

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  mentionUser?: { username: string } | null;
  onSubmit?: () => void;
  isPending?: boolean;
}

const MentionInput = forwardRef<TextInput, MentionInputProps>(
  (
    { value, onChangeText, placeholder, mentionUser, onSubmit, isPending },
    ref,
  ) => {
    const mentionText = mentionUser ? `@${mentionUser.username} ` : "";
    const getTextWidth = (text: string): number => {
      return [...text].reduce((acc, char) => {
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char);
        return acc + (isKorean ? 1.7 : 1);
      }, 0);
    };

    return (
      <View className="flex-1 flex-row items-center">
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: 4, zIndex: 1 }}
        >
          <Text className="text-primary">{mentionText}</Text>
        </View>
        <TextInput
          ref={ref}
          className={"flex-1"}
          style={{
            paddingLeft: mentionUser ? getTextWidth(mentionText) * 8 : 0,
          }}
          placeholder={placeholder}
          autoCapitalize="none"
          keyboardType="default"
          textAlignVertical="center"
          value={value}
          onChangeText={onChangeText}
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
