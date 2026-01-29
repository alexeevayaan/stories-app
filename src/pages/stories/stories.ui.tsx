import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextLayoutLine,
  View,
  ViewStyle
} from "react-native";

import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
} from "@shopify/react-native-skia";
import { useLayoutEffect, useRef, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("screen");

const IN_TO_LINE_INTERVAL = 2;
const OUT_TO_LINE_INTERVAL = 48;

const LINE_HEIGHT = 2;
const VERTICAL_PADDING = 24;
const HORIZONTAL_PADDING = 24;
const LINE_OPACITY_DISTANCE = 8;
const LINE_COLOR_DISTANCE = 1;
const COLORS = ["#ffffff", "rgb(0, 165, 184)", "#ffffff"];

function clamp(val: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(val, min), max);
}

interface ILines {
  xTop: number;
  xMiddle: number;
  xBottom: number;
  yLeft: number;
  yMiddle: number;
  yRight: number;
}

interface ILimitLines extends ILines {}

interface IActiveLines extends ILines {}

const useGetPositions = () => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const prevTranslationX = useSharedValue(0);
  const prevTranslationY = useSharedValue(0);

  return {
    translationX,
    translationY,
    prevTranslationX,
    prevTranslationY,
  };
};

export function StoriesScreen() {
  const inputRef = useRef<TextInput>(null);

  useLayoutEffect(() => {
    inputRef.current?.measure((_, __, w, h) => {
      textSize.value.height = h;
      textSize.value.width = w;
    });
  });

  const insets = useSafeAreaInsets();

  const [text, setText] = useState("j oijfoiewji dsa dasd\n\n asd asd ");

  const [lines, setLines] = useState<TextLayoutLine[]>([]);

  const ref = useRef<Text>(null);

  const textSize = useSharedValue({ width: 0, height: 0 });

  const { translationX, translationY, prevTranslationX, prevTranslationY } =
    useGetPositions();

  const activeLines = useRef<IActiveLines>({
    xTop: 0,
    xMiddle: 0,
    xBottom: 0,
    yLeft: 0,
    yMiddle: 0,
    yRight: 0,
  });

  const limitLines = useDerivedValue<ILimitLines>(() => {
    const xTop = Math.round(insets.top + VERTICAL_PADDING + LINE_HEIGHT);

    const middle = (height - insets.bottom - insets.top) / 2;
    const xMiddle = Math.round(
      insets.top + middle + LINE_HEIGHT - textSize.value.height / 2,
    );

    const xBottom = Math.round(
      height -
        insets.bottom -
        VERTICAL_PADDING -
        textSize.value.height -
        LINE_HEIGHT,
    );

    const yLeft =
      -Math.round(width / 2 - textSize.value.width / 2) +
      HORIZONTAL_PADDING +
      LINE_HEIGHT;

    const yMiddle = 0;

    const yRight =
      Math.round(width / 2 - textSize.value.width / 2) -
      HORIZONTAL_PADDING -
      LINE_HEIGHT;

    return {
      xTop,
      xMiddle,
      xBottom,
      yLeft,
      yMiddle,
      yRight,
    };
  });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  }));

  function snap(
    value: number,
    target: number,
    key: keyof IActiveLines,
  ): number {
    "worklet";

    const between = Math.abs(value - target);

    if (between <= IN_TO_LINE_INTERVAL) {
      if (!activeLines.current[key]) activeLines.current[key] = 1;

      return target;
    }

    if (activeLines.current[key] && between <= OUT_TO_LINE_INTERVAL) {
      if (!activeLines.current[key]) activeLines.current[key] = 1;

      return target;
    }

    if (activeLines.current[key]) activeLines.current[key] = 0;

    return value;
  }

  const cache = useRef({
    local: {
      x: 0,
      y: 0,
    },
    global: { x: 0, y: 0 },
  });

  function fixTraslation(
    type: "x" | "y",
    value: number,
    target: number,
    key: keyof IActiveLines,
  ): number {
    "worklet";

    const global =
      type === "x" ? cache.current.global.x : cache.current.global.y;
    const local = type === "x" ? cache.current.local.x : cache.current.local.y;

    const visual = value - global;

    const between = Math.abs(visual - target);

    const isIn = between <= IN_TO_LINE_INTERVAL;
    const isOut = between <= OUT_TO_LINE_INTERVAL;

    if (isIn && !activeLines.current[key]) {
      activeLines.current[key] = 1;

      if (type === "x") cache.current.local.x = value;
      else cache.current.local.y = value;
    }

    if (activeLines.current[key]) {
      if (isOut) {
        return target + global;
      }

      activeLines.current[key] = 0;

      const delta = value - local;

      if (type === "x") cache.current.global.x += delta;
      else cache.current.global.y += delta;

      return value;
    }

    return value;
  }

  const pan = Gesture.Pan()
    .onStart(() => {
      prevTranslationX.value = translationX.value;
      prevTranslationY.value = translationY.value;

      cache.current.global.x = 0;
      cache.current.global.y = 0;

      activeLines.current.xTop = 0;
      activeLines.current.xMiddle = 0;
      activeLines.current.xBottom = 0;
      activeLines.current.yLeft = 0;
      activeLines.current.yMiddle = 0;
      activeLines.current.yRight = 0;
    })
    .onUpdate((event) => {
      let x = prevTranslationX.value + event.translationX;
      let y = prevTranslationY.value + event.translationY;

      y = fixTraslation("y", y, limitLines.value.xMiddle, "xMiddle");
      y = fixTraslation("y", y, limitLines.value.xBottom, "xBottom");
      y = fixTraslation("y", y, limitLines.value.xTop, "xTop");

      x = fixTraslation("x", x, limitLines.value.yLeft, "yLeft");
      x = fixTraslation("x", x, limitLines.value.yMiddle, "yMiddle");
      x = fixTraslation("x", x, limitLines.value.yRight, "yRight");

      translationX.value = x - cache.current.global.x;
      translationY.value = y - cache.current.global.y;
    })
    .runOnJS(true);

  return (
    <View
      style={{
        width,
        height,
        alignItems: "center",
        backgroundColor: "#4343",
      }}
    >
      <Lines
        translationX={translationX}
        translationY={translationY}
        limitLines={limitLines}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyles}>
          <View
            style={{
              ...resetStyles.reset,
              flexDirection: "row",
            }}
          >
            <SkiaBackground
              lines={lines}
              textIsEmpty={!text || text?.length === 0}
            />
            <TextInput
              ref={inputRef}
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
  limitLines: SharedValue<ILimitLines>;
}

const Lines = ({ translationX, translationY, limitLines }: IPropsLines) => {
  const insets = useSafeAreaInsets();

  const topLineXStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationY.value,
        [
          limitLines.value.xTop - LINE_OPACITY_DISTANCE,
          limitLines.value.xTop,
          limitLines.value.xTop + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          limitLines.value.xTop - LINE_COLOR_DISTANCE,
          limitLines.value.xTop,
          limitLines.value.xTop + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const middleLineXStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationY.value,
        [
          limitLines.value.xMiddle - LINE_OPACITY_DISTANCE,
          limitLines.value.xMiddle,
          limitLines.value.xMiddle + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          limitLines.value.xMiddle - LINE_COLOR_DISTANCE,
          limitLines.value.xMiddle,
          limitLines.value.xMiddle + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const bottomLineXStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationY.value,
        [
          limitLines.value.xBottom - LINE_OPACITY_DISTANCE,
          limitLines.value.xBottom,
          limitLines.value.xBottom + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationY.value,
        [
          limitLines.value.xBottom - LINE_COLOR_DISTANCE,
          limitLines.value.xBottom,
          limitLines.value.xBottom + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const leftLineYStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationX.value,
        [
          limitLines.value.yLeft - LINE_OPACITY_DISTANCE,
          limitLines.value.yLeft,
          limitLines.value.yLeft + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationX.value,
        [
          limitLines.value.yLeft - LINE_COLOR_DISTANCE,
          limitLines.value.yLeft,
          limitLines.value.yLeft + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const middleLineYStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationX.value,
        [
          limitLines.value.yMiddle - LINE_OPACITY_DISTANCE,
          limitLines.value.yMiddle,
          limitLines.value.yMiddle + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationX.value,
        [
          limitLines.value.yMiddle - LINE_COLOR_DISTANCE,
          limitLines.value.yMiddle,
          limitLines.value.yMiddle + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const rightLineYStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translationX.value,
        [
          limitLines.value.yRight - LINE_OPACITY_DISTANCE,
          limitLines.value.yRight,
          limitLines.value.yRight + LINE_OPACITY_DISTANCE,
        ],
        [0, 1, 0],
      ),
      backgroundColor: interpolateColor(
        translationX.value,
        [
          limitLines.value.yRight - LINE_COLOR_DISTANCE,
          limitLines.value.yRight,
          limitLines.value.yRight + LINE_COLOR_DISTANCE,
        ],
        COLORS,
      ),
    };
  }, [limitLines]);

  const lines = [
    {
      style: [
        {
          width: "100%",
          height: LINE_HEIGHT,
          position: "absolute",
          top: VERTICAL_PADDING + insets.top,
        },
        topLineXStyle,
      ],
    },
    {
      style: [
        {
          width: "100%",
          height: LINE_HEIGHT,
          position: "absolute",
          bottom: (height - insets.bottom - LINE_HEIGHT) / 2,
        },
        middleLineXStyle,
      ],
    },
    {
      style: [
        {
          width: "100%",
          height: LINE_HEIGHT,
          position: "absolute",
          bottom: VERTICAL_PADDING + insets.bottom,
        },
        bottomLineXStyle,
      ],
    },
    {
      style: [
        {
          width: LINE_HEIGHT,
          height: "100%",
          position: "absolute",
          left: HORIZONTAL_PADDING,
          backgroundColor: "#8282ff",
        },
        leftLineYStyle,
      ],
    },
    {
      style: [
        {
          width: LINE_HEIGHT,
          height: "100%",
          position: "absolute",
          left: width / 2 - LINE_HEIGHT / 2,
          backgroundColor: "#8282ff",
        },
        middleLineYStyle,
      ],
    },
    {
      style: [
        {
          width: LINE_HEIGHT,
          height: "100%",
          position: "absolute",
          right: HORIZONTAL_PADDING,
          backgroundColor: "#8282ff",
        },
        rightLineYStyle,
      ],
    },
  ];

  return (
    <View
      pointerEvents="none"
      style={{
        ...StyleSheet.absoluteFillObject,
      }}
    >
      {lines.map((item, index) => {
        return (
          <Animated.View
            key={index}
            style={item.style as StyleProp<ViewStyle>[]}
          />
        );
      })}
    </View>
  );
};
