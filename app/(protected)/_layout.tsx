import { HeaderWithBack } from "@/components/Header";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";

const ProtectedLayout = () => {
  const { session, isLoading } = useAuthSession();

  if (isLoading) return null;
  if (!session) return <Redirect href="/sign-in" />;

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
      <Stack.Screen name="post/[postId]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProtectedLayout;