import { Easing, withTiming } from "react-native-reanimated";

export const withTimingAnimation = (value: number, duration: number = 150) => {
  "worklet";
  return withTiming(value, { duration, easing: Easing.linear });
};
