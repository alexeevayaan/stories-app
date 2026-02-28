import { useWindowDimensions } from "react-native";
import {
  cancelAnimation,
  clamp,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withTimingAnimation } from "../lib";
import { useKeyboard } from "./use_keyboard";
import { ILayout, useLayout } from "./use_layout";

interface IPropsUseTransform {
  layout: ReturnType<typeof useLayout>["layout"];
  wrapperLayout: SharedValue<ILayout>;
}

const PADDING = 16;
const FROM_BOTTOM = 64 + PADDING;
const FROM_TOP = 56 + PADDING;
const SOME_VALUES = FROM_BOTTOM + FROM_TOP;

export const useTransform = (props: IPropsUseTransform) => {
  const { layout, wrapperLayout } = props;

  const keyboardHeight = useKeyboard();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    offsetX,
    offsetY,
    savedOffsetX,
    savedOffsetY,
    scale,
    savedScale,
    rotation,
    savedRotation,
    isFocused,
    animatedStyles,
  } = useValues(props);

  const onFocus = () => {
    cancelAnimation(rotation);
    rotation.value = withTimingAnimation(0);
    offsetX.value = withTimingAnimation(24);
    isFocused.value = 1;
  };

  const onBlur = () => {
    isFocused.value = 0;
    cancelAnimation(scale);
    cancelAnimation(rotation);
    cancelAnimation(offsetX);
    cancelAnimation(offsetY);
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

      const empty =
        height - wrapperLayout.value.height - insets.top - FROM_BOTTOM;

      const center =
        (wrapperLayout.value.height - layout.value.height + FROM_TOP) / 2;

      cancelAnimation(offsetY);

      offsetY.value = withTimingAnimation(
        center -
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
      (height - keyboardHeight.value - insets.top - SOME_VALUES) /
        layout.value.height,
      1,
    );
  });

  useAnimatedReaction(
    () => [safeHeight.value, isFocused.value],
    ([newScale, isFocused]) => {
      if (!isFocused) return;
      cancelAnimation(scale);

      scale.value = withTimingAnimation(newScale);
    },
    [],
  );

  useAnimatedReaction(
    () => [layout.value.width, isFocused.value],
    ([layoutWidth, isFocused], prevValue) => {
      if (!isFocused || !prevValue?.[0]) return;

      cancelAnimation(savedOffsetX);

      savedOffsetX.value =
        savedOffsetX.value - (layoutWidth - prevValue[0]) / 2;
    },
    [],
  );

  useAnimatedReaction(
    () => [layout.value.height, isFocused.value],
    ([layoutHeight, isFocused], prevValue) => {
      if (!isFocused || !prevValue?.[0]) return;

      cancelAnimation(savedOffsetY);

      savedOffsetY.value =
        savedOffsetY.value - (layoutHeight - prevValue[0]) / 2;
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
    isFocused,
  };
};

const useValues = (props: IPropsUseTransform) => {
  const { layout, wrapperLayout } = props;

  const isFocused = useSharedValue(0);

  const centerY = useDerivedValue(
    () => wrapperLayout.value.height / 2 - layout.value.height / 2,
  );

  const offsetX = useSharedValue(24);
  const offsetY = useSharedValue(wrapperLayout.value.height / 3);
  const savedOffsetX = useSharedValue(24);
  const savedOffsetY = useSharedValue(centerY.value);

  useAnimatedReaction(
    () => layout.value,
    (_, prevValue) => {
      if (prevValue?.height === 0) {
        cancelAnimation(savedOffsetY);
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
      zIndex: isFocused.value ? 10000000 : 0,
    };
  });

  return {
    offsetX,
    offsetY,
    savedOffsetX,
    savedOffsetY,
    scale,
    savedScale,
    rotation,
    savedRotation,
    isFocused,
    animatedStyles,
  };
};
