import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { TextLayoutLine, useWindowDimensions } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { resetStyles } from "../config";

interface IPropsSkiaBackground {
  lines: TextLayoutLine[];
  textIsEmpty: boolean;
  backgroundColor: SharedValue<string>;
  padding?: number;
  r?: number;
  blur?: number;
}

export const SkiaBackground = ({
  lines,
  textIsEmpty,
  backgroundColor,
  padding = 20,
  r = 1,
  blur = 1,
}: IPropsSkiaBackground) => {
  const { width, height } = useWindowDimensions();

  return (
    <Canvas
      style={{
        position: "absolute",
        left: -100,
        right: -100,
        bottom: -100,
        top: -100,
        ...resetStyles.reset,
        padding: 40,
      }}
    >
      <Group
        color={backgroundColor}
        dither={true}
        layer={
          <Paint>
            <Blur blur={blur} />
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
                x={line.x + 100 - padding / 2}
                y={line.y + 100 - padding / 2}
                width={Math.min(line.width + padding, width)}
                height={line.height + padding}
                r={r}
              >
                <SweepGradient
                  c={vec(height / 3, height / 2)}
                  colors={["cyan", "magenta", "yellow", "cyan"]}
                />
              </RoundedRect>
            );
          })}
      </Group>
    </Canvas>
  );
};
