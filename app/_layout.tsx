import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="welcome"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="home"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen
            name="stories"
            options={{ headerShown: false, animation: "fade" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </SafeAreaListener>
  );
}
