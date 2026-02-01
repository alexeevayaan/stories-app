import { useWindowDimensions } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import {
  clamp,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withTimingAnimation } from "../lib";
import { ILayout, useLayout } from "./use_layout";

interface IPropsUseTransform {
  layout: ReturnType<typeof useLayout>["layout"];
  wrapperLayout: SharedValue<ILayout>;
}

export const useTransform = (props: IPropsUseTransform) => {
  const { layout, wrapperLayout } = props;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isFocused = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);

  const centerX = useDerivedValue(
    () => wrapperLayout.value.width / 2 - layout.value.width / 2,
  );
  const centerY = useDerivedValue(
    () => wrapperLayout.value.height / 2 - layout.value.height / 2,
  );

  const offsetX = useSharedValue(centerX.value);
  const offsetY = useSharedValue(centerY.value);
  const savedOffsetX = useSharedValue(centerX.value);
  const savedOffsetY = useSharedValue(centerY.value);

  useAnimatedReaction(
    () => layout.value,
    (_, prevValue) => {
      if (prevValue?.height === 0 && prevValue?.width === 0) {
        offsetX.value = centerX.value;
        savedOffsetX.value = centerX.value;
        offsetY.value = centerY.value;
        savedOffsetY.value = centerY.value;
      }
    },
  );

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: offsetX.value },
        { translateY: offsetY.value },
        { scale: scale.value },
        { rotateZ: `${rotation.value}rad` },
      ],
      position: "absolute",
    };
  });

  const onFocus = () => {
    scale.value = withTimingAnimation(1);
    rotation.value = withTimingAnimation(0);

    isFocused.value = 1;
  };

  const onBlur = () => {
    isFocused.value = 0;

    scale.value = withTimingAnimation(savedScale.value);
    rotation.value = withTimingAnimation(savedRotation.value);

    offsetX.value = withTimingAnimation(savedOffsetX.value);
    offsetY.value = withTimingAnimation(savedOffsetY.value);
  };

  useAnimatedReaction(
    () => {
      return {
        layout,
        isFocused,
        keyboardHeight,
        wrapperLayout,
      };
    },
    (value) => {
      "worklet";
      const { layout, isFocused, keyboardHeight, wrapperLayout } = value;

      if (!isFocused.value || !keyboardHeight.get()) return;

      const empty = height - wrapperLayout.value.height - insets.top;

      offsetX.value = withTimingAnimation(width / 2 - layout.get().width / 2);
      offsetY.value = withTimingAnimation(
        wrapperLayout.value.height / 2 -
          layout.value.height / 2 -
          clamp(
            keyboardHeight.value - empty,
            empty,
            Math.abs(keyboardHeight.value),
          ) /
            2,
      );
    },
    [],
  );

  const safeHeight = useDerivedValue(() => {
    return Math.min(
      (height - keyboardHeight.value - insets.top) / layout.value.height,
      1,
    );
  });

  useAnimatedReaction(
    () => [safeHeight.value, isFocused.value],
    ([newScale, isFocused]) => {
      if (!isFocused) return;

      scale.value = newScale;
    },
    [],
  );

  useAnimatedReaction(
    () => [layout.value.width, isFocused.value],
    ([layoutWidth, isFocused], prevValue) => {
      if (!isFocused || !prevValue?.[0]) return;
      savedOffsetX.value =
        savedOffsetX.value - (layoutWidth - prevValue[0]) / 2;
    },
    [],
  );

  useAnimatedReaction(
    () => [layout.value.height, isFocused.value],
    ([layoutHeight, isFocused], prevValue) => {
      if (!isFocused || !prevValue?.[0]) return;
      savedOffsetY.value =
        savedOffsetY.value - (layoutHeight - prevValue[0]) / 2;
    },
    [],
  );

  useKeyboardHandler(
    {
      onStart: (e) => {
        "worklet";
        keyboardHeight.value = e.height;
      },
    },
    [],
  );

  return {
    offsetX,
    offsetY,
    savedOffsetX,
    savedOffsetY,
    scale,
    savedScale,
    rotation,
    savedRotation,
    animatedStyles,
    onFocus,
    onBlur,
  };
};
