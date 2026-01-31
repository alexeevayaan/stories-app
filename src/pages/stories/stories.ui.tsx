import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
} from "@shopify/react-native-skia";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputContentSizeChangeEvent,
  TextLayoutLine,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  clamp,
  Easing,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StoriesEdit, StoriesLayout, StoriesPanel } from "./ui";
import { useStories } from "./usecase";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ILayout {
  width: number;
  height: number;
}

const withTimingAnimation = (value: number, duration: number = 150) => {
  "worklet";
  return withTiming(value, { duration, easing: Easing.linear });
};

type TPropsUseLayout = {
  inputRef: RefObject<TextInput | null>;
};

const useLayout = (props: TPropsUseLayout) => {
  const layout = useSharedValue<ILayout>({
    width: 0,
    height: 0,
  });
  const { inputRef } = props;

  useLayoutEffect(() => {
    inputRef.current?.measure((x, y, w, h) => {
      layout.value.width = w;
      layout.value.height = h;
    });
  }, []);

  const onContentSizeChange = (e: TextInputContentSizeChangeEvent) => {
    layout.value = {
      width: e.nativeEvent.contentSize.width,
      height: e.nativeEvent.contentSize.height,
    };
  };

  return { layout, onContentSizeChange };
};

interface IPropsUseTransform {
  layout: ReturnType<typeof useLayout>["layout"];
  wrapperLayout: SharedValue<ILayout>;
}

const useTransform = (props: IPropsUseTransform) => {
  const { layout, wrapperLayout } = props;

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isFocused = useSharedValue(0);
  const keyboradHeight = useSharedValue(0);

  const offsetX = useSharedValue(
    wrapperLayout.get().width / 2 - layout.get().width / 2,
  );
  const offsetY = useSharedValue(
    wrapperLayout.get().height / 2 - layout.get().height / 2,
  );
  const savedOffsetX = useSharedValue(
    wrapperLayout.get().width / 2 - layout.get().width / 2,
  );
  const savedOffsetY = useSharedValue(
    wrapperLayout.get().height / 2 - layout.get().height / 2,
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
      width: isFocused ? width : "auto",
      backgroundColor: "green",
    };
  });

  const onFocus = () => {
    isFocused.value = 1;
    scale.value = withTimingAnimation(1);
    rotation.value = withTimingAnimation(0);
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
        keyboradHeight,
        wrapperLayout,
      };
    },
    (value) => {
      "worklet";
      const { layout, isFocused, keyboradHeight } = value;

      if (!isFocused.value || !keyboradHeight.get()) return;

      const empty = height - wrapperLayout.get().height - insets.top;

      offsetX.value = width / 2 - layout.get().width / 2;
      offsetY.value =
        wrapperLayout.get().height / 2 -
        layout.get().height / 2 -
        clamp(
          keyboradHeight.get() - empty,
          empty,
          Math.abs(keyboradHeight.get()),
        ) /
          2;
    },
    [],
  );

  useKeyboardHandler(
    {
      onStart: (e) => {
        "worklet";
        keyboradHeight.value = e.height;
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

type TPropsUseGesture = {
  transform: ReturnType<typeof useTransform>;
  inputRef: RefObject<TextInput | null>;
};

const useGesture = (props: TPropsUseGesture) => {
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
      console.log("Single tap!");
    });

  const doubleTap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      console.log("Double tap!");
    });

  const tap = Gesture.Exclusive(doubleTap, singleTap);

  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      offsetX.value = savedOffsetX.value + e.translationX;
      offsetY.value = savedOffsetY.value + e.translationY;
    })
    .onEnd(() => {
      savedOffsetX.value = offsetX.value;
      savedOffsetY.value = offsetY.value;
    });

  const zoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
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

interface IPropsItem {
  id: string;
  focusedId: SharedValue<string>;
  wrapperLayout: SharedValue<ILayout>;
}

function Item(props: IPropsItem) {
  const { focusedId, id } = props;
  const inputRef = useRef<TextInput>(null);

  const layout = useLayout({ inputRef });

  const transform = useTransform({
    layout: layout.layout,
    wrapperLayout: props.wrapperLayout,
  });

  const composed = useGesture({ transform, inputRef });

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  const [text, setText] = useState("s");
  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={transform.animatedStyles}>
        <View style={{ flexDirection: "row" }}>
          <SkiaBackground
            lines={lines}
            textIsEmpty={!text || text?.length === 0}
          />
          <AnimatedTextInput
            value={text}
            onChangeText={setText}
            ref={inputRef}
            multiline
            scrollEnabled={false}
            onFocus={() => {
              focusedId.value = id;
              transform.onFocus();
            }}
            onBlur={() => {
              focusedId.value = "";
              transform.onBlur();
            }}
            style={{
              textAlign: "center",
              textAlignVertical: "center",
              fontSize: 32,
              color: "rgba(1,1,1,0)",
              ...resetStyles.reset,
            }}
            onContentSizeChange={layout.onContentSizeChange}
            autoCorrect={false}
            autoCapitalize="none"
            selectTextOnFocus={false}
            spellCheck
          />
          <Animated.Text
            pointerEvents="none"
            onTextLayout={(e) => {
              setLines(e.nativeEvent.lines);
            }}
            style={{
              textAlign: "center",
              textAlignVertical: "center",
              fontSize: 32,
              color: "#000000",
              ...resetStyles.reset,
              ...StyleSheet.absoluteFillObject,
            }}
          >
            {text}
          </Animated.Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function StoriesScreen() {
  const wrapperLayout = useSharedValue<ILayout>({
    width: 0,
    height: 0,
  });

  const storiesServise = useStories();

  const focusedId = useSharedValue<string>("");

  return (
    <StoriesLayout layout={wrapperLayout}>
      <StoriesPanel create={storiesServise.create} />
      {storiesServise.stories.map((i) => {
        return (
          <Item
            key={i.id}
            id={i.id}
            focusedId={focusedId}
            wrapperLayout={wrapperLayout}
          />
        );
      })}

      <StoriesEdit focusedId={focusedId} />
    </StoriesLayout>
  );
}

const resetStyles = StyleSheet.create({
  reset: {
    margin: 0,
    marginBlock: 0,
    marginBlockEnd: 0,
    marginBlockStart: 0,
    marginBottom: 0,
    marginEnd: 0,
    marginHorizontal: 0,
    marginLeft: 0,
    marginRight: 0,
    marginStart: 0,
    marginTop: 0,
    marginVertical: 0,
    padding: 0,
    paddingBlock: 0,
    paddingBlockEnd: 0,
    paddingBlockStart: 0,
    paddingBottom: 0,
    paddingEnd: 0,
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingStart: 0,
    paddingTop: 0,
    paddingVertical: 0,
    paddingInline: 0,
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    marginInline: 0,
    marginInlineStart: 0,
    marginInlineEnd: 0,
  },
});

interface IPropsSkiaBackground {
  lines: TextLayoutLine[];
  textIsEmpty: boolean;
}

const SkiaBackground = ({ lines, textIsEmpty }: IPropsSkiaBackground) => {
  return (
    <Canvas
      style={{
        ...StyleSheet.absoluteFillObject,
        ...resetStyles.reset,
        padding: 40,
      }}
    >
      <Group
        color="orange"
        dither={true}
        layer={
          <Paint>
            <Blur blur={4} />
            <ColorMatrix
              matrix={[
                1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 18, -7,
              ]}
            />
          </Paint>
        }
      >
        {!textIsEmpty &&
          lines?.length > 0 &&
          lines.map((line, index) => {
            if (line.text.trim().length === 0) return null;

            return (
              <RoundedRect
                key={index}
                x={line.x}
                y={line.y}
                width={line.width}
                height={line.height}
                r={1}
              />
            );
          })}
      </Group>
    </Canvas>
  );
};
