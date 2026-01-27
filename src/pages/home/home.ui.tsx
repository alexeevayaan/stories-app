import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TextLayoutLine,
  View,
} from "react-native";

import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
} from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

const { width, height } = Dimensions.get("screen");

export function HomeScreen() {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const [text, setText] = useState("j oijfoiewji dsa dasd\n\n asd asd ");

  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  const ref = useRef<Text>(null);

  const textSize = useSharedValue({ width: 0, height: 0 });

  // Gesture handler
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const maxTranslateX = width - containerSize.width / 2;
      const maxTranslateY = height - containerSize.height / 2;

      translationX.value = clamp(
        prevTranslationX.value + event.translationX,
        -maxTranslateX,
        maxTranslateX,
      );
      translationY.value = clamp(
        prevTranslationY.value + event.translationY,
        -maxTranslateY,
        maxTranslateY,
      );
    })
    .runOnJS(true);

  return (
    <View
      style={{
        width,
        height,
      }}
    >
      <Lines
        translationX={translationX}
        translationY={translationY}
        textSize={textSize}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyles}>
          <View
            style={{
              ...resetStyles.reset,
            }}
          >
            <SkiaBackground
              lines={lines}
              textIsEmpty={!text || text?.length === 0}
            />
            <TextInput
              value={text}
              onChangeText={setText}
              multiline={true}
              scrollEnabled={false}
              placeholder="Type here..."
              style={{
                textAlign: "center",
                textAlignVertical: "center",
                fontSize: 24,
                color: "transparent",
                ...resetStyles.reset,
              }}
              onContentSizeChange={(e) => {
                setContainerSize(e.nativeEvent.contentSize);
                textSize.value = e.nativeEvent.contentSize;
              }}
            />
            <Text
              ref={ref}
              pointerEvents="none"
              onTextLayout={(e) => {
                setLines(e.nativeEvent.lines);
              }}
              style={{
                textAlign: "center",
                textAlignVertical: "center",
                fontSize: 24,
                color: "#000000",
                ...StyleSheet.absoluteFillObject,
                ...resetStyles.reset,
              }}
            >
              {text}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
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

interface IPropsLines {
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  textSize: SharedValue<{ width: number; height: number }>;
}

const LINE_HEIGHT = 2;
const VERTICAL_PADDING = 24;
const LINE_OPACITY_DISTANCE = 8;

const Lines = ({ translationX, translationY, textSize }: IPropsLines) => {
  const insets = useSafeAreaInsets();

  useAnimatedReaction(
    () => translationY.value,
    (currentY) => {
      console.log("translationY:", currentY);
    },
  );

  const topLineXStyle = useAnimatedStyle(() => {
    const targetValue = Math.floor(insets.top + VERTICAL_PADDING + LINE_HEIGHT);

    return {
      opacity: interpolate(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        ["#8282ff", "#06f957", "#8282ff"],
      ),
    };
  }, [textSize]);

  const middleLineXStyle = useAnimatedStyle(() => {
    const middle =
      (height - insets.bottom - insets.top - VERTICAL_PADDING * 2) / 2;

    const targetValue = Math.floor(
      insets.top + VERTICAL_PADDING + middle + 1 - textSize.value.height / 2,
    );

    return {
      opacity: interpolate(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        ["#8282ff", "#06f957", "#8282ff"],
      ),
    };
  }, [textSize]);

  const bottomLineXStyle = useAnimatedStyle(() => {
    const targetValue = Math.floor(
      height -
        insets.bottom -
        VERTICAL_PADDING -
        textSize.value.height -
        LINE_HEIGHT,
    );

    return {
      opacity: interpolate(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          targetValue - LINE_OPACITY_DISTANCE,
          targetValue,
          targetValue + LINE_OPACITY_DISTANCE,
        ],
        ["#8282ff", "#06f957", "#8282ff"],
      ),
    };
  }, [textSize]);

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: insets.top,
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
        // backgroundColor: "red",
      }}
    >
      <Animated.View
        style={[
          {
            backgroundColor: "#0e6178",
            width: "100%",
            height: LINE_HEIGHT,
            position: "absolute",
            top: VERTICAL_PADDING,
          },
          topLineXStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            backgroundColor: "#0e6178",
            width: "100%",
            height: LINE_HEIGHT,
            position: "absolute",
            bottom: (height - insets.bottom - insets.top) / 2,
          },
          middleLineXStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            backgroundColor: "#0e6178",
            width: "100%",
            height: LINE_HEIGHT,
            position: "absolute",
            bottom: VERTICAL_PADDING,
          },
          bottomLineXStyle,
        ]}
      />
    </View>
  );
};
