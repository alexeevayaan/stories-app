import { RefObject } from "react";
import { type TextInput } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useTransform } from "./use_transform";

type TPropsUseGesture = {
  transform: ReturnType<typeof useTransform>;
  inputRef: RefObject<TextInput | null>;
};

export const useGesture = (props: TPropsUseGesture) => {
  const {
    transform: {
      offsetX,
      offsetY,
      savedOffsetX,
      savedOffsetY,
      scale,
      savedScale,
      rotation,
      savedRotation,
      isFocused,
    },
    inputRef,
  } = props;

  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .onTouchesMove((_, state) => {
      if (isFocused.value) state.fail();
    })
    .onStart(() => {
      inputRef.current?.focus?.();
    });

  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .numberOfTaps(2)
    .onTouchesMove((_, state) => {
      if (isFocused.value) state.fail();
    })
    .onStart(() => {});

  const tap = Gesture.Exclusive(doubleTap, singleTap);

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onTouchesMove((_, state) => {
      if (isFocused.value) state.fail();
    })
    .onStart(() => {})
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const zoomGesture = Gesture.Pinch()
    .onTouchesMove((_, state) => {
      if (isFocused.value) state.fail();
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onTouchesMove((_, state) => {
      if (isFocused.value) state.fail();
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(tap, zoomGesture, rotateGesture),
  );

  return composed;
};
