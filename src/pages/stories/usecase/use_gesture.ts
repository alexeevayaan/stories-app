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
    },
    inputRef,
  } = props;

  const singleTap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .onStart(() => {
      inputRef.current?.focus?.();
    });

  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {});

  const tap = Gesture.Exclusive(doubleTap, singleTap);

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
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
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    });

  const rotateGesture = Gesture.Rotation()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(tap, zoomGesture, rotateGesture),
  );

  return composed;
};
