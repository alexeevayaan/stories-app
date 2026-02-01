import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";

export const useKeyboard = () => {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onStart: (e) => {
        "worklet";
        if (!e.height) return;
        keyboardHeight.value = e.height;
      },
    },
    [],
  );

  return keyboardHeight;
};
