import { fonts } from "@/src/shared/assets/fonts/fonts";
import { Canvas, Paragraph, Skia, TileMode } from "@shopify/react-native-skia";
import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";

type TContentSize = { width: number; height: number };

// Our background shader
const source = Skia.RuntimeEffect.Make(`
uniform vec4 position;
uniform vec4 colors[4];

vec4 main(vec2 pos) {
  vec2 uv = (pos - vec2(position.x, position.y))/vec2(position.z, position.w);
  vec4 colorA = mix(colors[0], colors[1], uv.x);
  vec4 colorB = mix(colors[2], colors[3], uv.x);
  return mix(colorA, colorB, uv.y);
}`)!;

const colors = [
  // #dafb61
  0.85, 0.98, 0.38, 1.0,
  // #61dafb
  0.38, 0.85, 0.98, 1.0,
  // #fb61da
  0.98, 0.38, 0.85, 1.0,
  // #61fbcf
  0.38, 0.98, 0.81, 1.0,
];

const MyParagraph = ({ text, size }: { text: string; size: TContentSize }) => {
  const paragraph = useMemo(() => {
    // Create a background paint.
    const backgroundPaint = Skia.Paint();
    backgroundPaint.setShader(source.makeShader([0, 0, 256, 256, ...colors]));

    // Create a foreground paint. We use a radial gradient.
    const foregroundPaint = Skia.Paint();
    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: 0, y: 0 },
        256,
        [Skia.Color("magenta"), Skia.Color("yellow")],
        null,
        TileMode.Clamp,
      ),
    );

    const para = Skia.ParagraphBuilder.Make()
      .pushStyle(
        {
          fontFamilies: ["Roboto"],
          fontSize: 32,
          fontStyle: { weight: 500 },
          color: Skia.Color("red"),
        },
        // foregroundPaint,
        // backgroundPaint,
      )
      .addText(text)
      // .pop()
      .build();
    return para;
  }, [text]);

  return (
    <Canvas style={{ ...StyleSheet.absoluteFillObject }} pointerEvents="none">
      <Paragraph paragraph={paragraph} x={0} y={0} width={size.width} />
    </Canvas>
  );
};

interface IMagicTextProps {
  color: SharedValue<string>;
  backgroundColor: SharedValue<string>;
  fontSize: SharedValue<number>;
  ref: React.Ref<IMagicTextHandlers>;
}

interface IMagicTextHandlers {
  getSize(): TContentSize;
}

const MagicText = (props: IMagicTextProps) => {
  const { color, backgroundColor, fontSize, ref } = props;

  const [text, setText] = useState<string>("");

  const [size, setSize] = useState<TContentSize>({
    width: 0,
    height: 0,
  });

  const [lines, setLines] = useState([]);

  useImperativeHandle(ref, () => {
    return {
      getSize() {
        return size;
      },
    };
  });

  const { width } = useWindowDimensions();
  return (
    <View>
      {/* <SkiaBackground
        lines={lines}
        textIsEmpty={!text || text?.length === 0}
        backgroundColor={backgroundColor}
      /> */}
      <Text
        onTextLayout={(e) => {
          setLines(e.nativeEvent.lines as any);
        }}
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            fontFamily: fonts.RobotoRegular,
            fontSize: fontSize.value,
            lineHeight: fontSize.value + 2,
            padding: 0,
            paddingBottom: 0,
            paddingTop: 0,
            color: color.value,
            opacity: 1,
            width: "100%",
          },
        ]}
      >
        <Text>{text}</Text>
      </Text>
      <TextInput
        autoFocus
        onContentSizeChange={(e) => {
          setSize(e.nativeEvent.contentSize);
        }}
        placeholder=" "
        value={text}
        onChangeText={setText}
        multiline
        scrollEnabled={false}
        style={[
          {
            fontFamily: fonts.RobotoRegular,
            fontSize: fontSize.value,
            lineHeight: fontSize.value + 2,
            padding: 0,
            paddingBottom: 0,
            paddingTop: 0,
            color: "rgba(1,1,1,0)",
            width,
          },
        ]}
      />
    </View>
  );
};

export function HomeScreen() {
  const fontSize = useSharedValue(44);
  const color = useSharedValue("#212121");
  const bColor = useSharedValue("#1244FF");
  const ref = useRef<IMagicTextHandlers>(null);

  return (
    <View style={styles.container}>
      <MagicText
        fontSize={fontSize}
        color={color}
        backgroundColor={bColor}
        ref={ref}
      />
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
