import { HeaderWithBack } from "@/components/Header";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";

const ProtectedLayout = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading } = useAuthSession(queryClient);

  if (isLoading) return null;
  if (!isLoggedIn) return <Redirect href="/sign-in" />;

  return (
    <Stack
      screenOptions={{
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="notification"
        options={{ header: () => <HeaderWithBack name="NOTIFICATION" /> }}
      />
      <Stack.Screen
        name="setting"
        options={{ header: () => <HeaderWithBack name="SETTING" /> }}
      />
      <Stack.Screen
        name="profile"
        options={{
          header: () => <HeaderWithBack name="EDIT_PROFILE" />,
        }}
      />
      <Stack.Screen name="user/[userId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="user/search"
        options={{ header: () => <HeaderWithBack name="SEARCH_FRIEND" /> }}
      />
      <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
      <Stack.Screen
        name="change-password"
        options={{ header: () => <HeaderWithBack name="CHANGE_PASSWORD" /> }}
      />
    </Stack>
  );
};

export default ProtectedLayout;
