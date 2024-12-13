import { forwardRef } from "react";
import { TextInput, View } from "react-native";

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  isPending?: boolean;
}

const MentionInput = forwardRef<TextInput, MentionInputProps>(
  ({ value, onChangeText, placeholder, onSubmit, isPending }, ref) => {
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
            value={value}
            onChangeText={onChangeText}
            returnKeyType="send"
            onSubmitEditing={() => {
              if (value.trim() && !isPending && onSubmit) {
                onSubmit();
              }
            }}
            placeholder={placeholder}
            multiline={false}
          />
        </View>
      </View>
    );
  },
);

export default MentionInput;
