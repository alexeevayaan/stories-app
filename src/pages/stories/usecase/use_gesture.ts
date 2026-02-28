import { RefObject } from "react";
import { TextLayoutLine, type TextInput } from "react-native";
import { Gesture, GestureTouchEvent } from "react-native-gesture-handler";
import { GestureStateManagerType } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gestureStateManager";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import { useTransform } from "./use_transform";

const hitSlop = { top: 0, bottom: 0, left: 0, right: 0 };

type LineMetric = {
  x: number;
  y: number;
  width: number;
  height: number;
  ascender: number;
  descender: number;
  capHeight: number;
  xHeight: number;
  text: string;
};

type Rect = { x: number; y: number; width: number; height: number };

const isInsideRect = (px: number, py: number, r: Rect) => {
  "worklet";
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
};

const unionLinesRect = (lines: LineMetric[]): Rect => {
  "worklet";

  const left = Math.min(...lines.map((l) => l.x));
  const top = Math.min(...lines.map((l) => l.y));
  const right = Math.max(...lines.map((l) => l.x + l.width));
  const bottom = Math.max(...lines.map((l) => l.y + l.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
};

type TPropsUseGesture = {
  transform: ReturnType<typeof useTransform>;
  inputRef: RefObject<TextInput | null>;
  lines: SharedValue<TextLayoutLine[]>;
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
    lines,
  } = props;
  const active = useSharedValue(false);

  const onUnactivate = () => {
    "worklet";
    active.value = false;
  };

  const onTouchesMove = (
    e: GestureTouchEvent,
    state: GestureStateManagerType,
  ) => {
    "worklet";

    if (isFocused.value) state.fail();

    if (active.value) return;

    const t = e.allTouches[0];
    if (!t) return;

    const ok = isInsideRect(t.x, t.y, unionLinesRect(lines.value));

    if (!ok) {
      state.fail();
      return;
    }

    active.value = true;
  };

  const tap = Gesture.Tap()
    .runOnJS(true)
    .hitSlop(hitSlop)
    .maxDuration(250)
    .onStart((e) => {
      if (isFocused.value) return;

      const ok = isInsideRect(e.x, e.y, unionLinesRect(lines.value));

      if (!ok) return;

      inputRef.current?.focus?.();
    });

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .hitSlop(hitSlop)
    .onTouchesMove(onTouchesMove)
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    })
    .onFinalize(() => {
      onUnactivate();
    });

  const zoomGesture = Gesture.Pinch()
    .hitSlop(hitSlop)
    .onTouchesMove(onTouchesMove)
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    })
    .onFinalize(() => {
      onUnactivate();
    });

  const rotateGesture = Gesture.Rotation()
    .hitSlop(hitSlop)
    .onTouchesMove(onTouchesMove)
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    })
    .onFinalize(() => {
      onUnactivate();
    });

  const composed = Gesture.Simultaneous(
    dragGesture,
    Gesture.Simultaneous(tap, zoomGesture, rotateGesture),
  );

  return composed;
};
