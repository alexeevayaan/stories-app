import {
  Blur,
  Canvas,
  ColorMatrix,
  Group,
  Paint,
  RoundedRect,
} from "@shopify/react-native-skia";
import { StyleSheet, TextLayoutLine } from "react-native";
import {
  SharedValue
} from "react-native-reanimated";
import { resetStyles } from "../config";

interface IPropsSkiaBackground {
  lines: TextLayoutLine[];
  textIsEmpty: boolean;
  backgroundColor: SharedValue<string>;
}

export const SkiaBackground = ({
  lines,
  textIsEmpty,
  backgroundColor,
}: IPropsSkiaBackground) => {
  return (
    <Canvas
      style={{
        ...StyleSheet.absoluteFillObject,
        ...resetStyles.reset,
        padding: 40,
      }}
    >
      <Group
        color={backgroundColor}
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
