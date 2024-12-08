import { forwardRef, useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  setReplyTo: (
    replyTo: {
      userId: string;
      username: string;
      parentId: number;
      replyCommentId: number;
    } | null,
  ) => void;
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
      setReplyTo,
      placeholder,
      mentionUser,
      onSubmit,
      isPending,
    },
    ref,
  ) => {
    const mentionText = mentionUser ? `@${mentionUser.username} ` : "";
    const [inputValue, setInputValue] = useState(mentionText + value);

    const handleChangeText = (text: string) => {
      if (text.startsWith(mentionText)) {
        const newText = text.slice(mentionText.length);
        setInputValue(text);
        onChangeText(newText);
      } else {
        onChangeText(text);
        if (mentionUser) {
          setReplyTo(null);
        }
      }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      if (mentionUser && !inputValue.startsWith(mentionText)) {
        setInputValue(mentionText + value);
      }
    }, [mentionUser, mentionText]);

    return (
      <View className="flex-1 flex-row items-center">
        <View
          pointerEvents="box-only"
          className="h-[50px] w-full flex-1 flex-row items-center gap-2 rounded-[10px] border border-gray-20 px-[13px] "
        >
          <TextInput
            ref={ref}
            className="flex-1 font-pregular text-[16px] text-gray-90 leading-[150%]"
            autoCapitalize="none"
            keyboardType="default"
            textAlignVertical="center"
            value={inputValue}
            onChangeText={handleChangeText}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (value.trim() && !isPending && onSubmit) {
                onSubmit();
                setInputValue("");
              }
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
            }}
          />
          {mentionText ? (
            <Text className="absolute bg-white pl-[11.5px] font-pmedium text-[16px] text-primary leading-[150%]">
              {mentionText}
            </Text>
          ) : null}
        </View>
      </View>
    );
  },
);

export default MentionInput;
