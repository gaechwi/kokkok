import { Stack } from "expo-router";
export default function FriendLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, animation: "none" }}
      />
      <Stack.Screen
        name="request"
        options={{ headerShown: false, animation: "none" }}
      />
    </Stack>
  );
}
