import { Canvas, Paragraph, Skia, TileMode } from "@shopify/react-native-skia";
import React, { useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  dispatchCommand,
  useAnimatedRef,
  useEvent,
  useHandler,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function ReanimatedTextInput() {
  const animatedRef = useAnimatedRef();

  const handlers = {
    onChange: (event: any) => {
      "worklet";
      console.log("event", event);
    },
  };
  const { doDependenciesDiffer } = useHandler(handlers);

  const textInputHandler = useEvent(
    (event: any) => {
      "worklet";
      const { onChange } = handlers;
      if (onChange) {
        const textWithoutSpecialCharacters = event.text.replace(
          /[^a-zA-Z]+/g,
          "",
        );
        if (textWithoutSpecialCharacters !== event.text) {
          dispatchCommand(animatedRef, "setTextAndSelection", [
            event.eventCount,
            textWithoutSpecialCharacters,
            -1,
            -1,
          ]);
        }
        onChange(event);
      }
    },
    ["onChange"],
    doDependenciesDiffer,
  );

  return (
    <AnimatedTextInput
      style={{
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 100,
      }}
      onChange={textInputHandler}
      ref={animatedRef}
    />
  );
}

export function HomeScreen() {
  const dd = useRef<Text>(null);

  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      {/* <MyParagraph /> */}
      <ReanimatedTextInput />
      <Text ref={dd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

const MyParagraph = () => {
  const paragraph = useMemo(() => {
    const foregroundPaint = Skia.Paint();

    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: 0, y: 0 },
        256,
        [Skia.Color("orange"), Skia.Color("purple")],
        null,
        TileMode.Clamp,
      ),
    );

    const para = Skia.ParagraphBuilder.Make()
      .pushStyle(
        {
          fontFamilies: ["Roboto"],
          fontSize: 42,
          fontStyle: { weight: 500 },
          color: Skia.Color("black"),
          shadows: [
            {
              blurRadius: 12,
              color: Skia.Color("orange"),
              offset: Skia.Point(1, 2),
            },
            {
              blurRadius: 12,
              color: Skia.Color("blue"),
              offset: Skia.Point(1, 2),
            },
          ],
        },
        foregroundPaint,
      )
      .addText("Say Hello to React Native Skia")
      .pop()
      .build();
    return para;
  }, []);

  return (
    <Canvas style={{ width: 356, height: 256, backgroundColor: "green" }}>
      <Paragraph paragraph={paragraph} x={20} y={0} width={256} />
    </Canvas>
  );
};
