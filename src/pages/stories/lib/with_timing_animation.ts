import {
  AnimationCallback,
  Easing,
  withTiming,
  WithTimingConfig,
} from "react-native-reanimated";

export const withTimingAnimation = <T extends string | number>(
  value: T,
  userConfig?: WithTimingConfig,
  callback?: AnimationCallback,
) => {
  "worklet";
  return withTiming(
    value,
    userConfig || { duration: 150, easing: Easing.linear },
    callback,
  );
};
