import {
    Canvas,
    Paragraph,
    Skia,
    TileMode,
    useFonts,
} from "@shopify/react-native-skia";
import { useMemo } from "react";
import { type TextLayoutLine } from "react-native";
import { type SharedValue } from "react-native-reanimated";
import { type ILayout } from "../usecase";

const MyParagraphItem = ({ item }: { item: TextLayoutLine }) => {
  const customFontMgr = useFonts({
    BitcountGridDoubleMedium: [
      require("../../../shared/assets/fonts/BitcountGridDouble-Medium.ttf"),
    ],
  });

  const paragraph = useMemo(() => {
    if (!customFontMgr) {
      return null;
    }

    const foregroundPaint = Skia.Paint();

    foregroundPaint.setShader(
      Skia.Shader.MakeRadialGradient(
        { x: 0, y: 0 },
        506,
        [Skia.Color("green"), Skia.Color("yellow")],
        null,
        TileMode.Clamp,
      ),
    );

    const para = Skia.ParagraphBuilder.Make({}, customFontMgr)
      .pushStyle(
        {
          fontFamilies: ["BitcountGridDoubleMedium"],
          fontSize: 32,
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
      .addText(item.text)
      .pop()
      .build();
    return para;
  }, [item.text, customFontMgr]);

  return (
    <Paragraph
      paragraph={paragraph}
      x={item.x}
      y={item.y}
      width={item.width + 10}
    />
  );
};

export const StoriesItemText = ({
  lines,
  layout,
}: {
  lines: TextLayoutLine[];
  layout: SharedValue<ILayout>;
}) => {
  return (
    <Canvas
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
      }}
    >
      {lines.map((i, index) => {
        return <MyParagraphItem key={index} item={i} />;
      })}
    </Canvas>
  );
};
