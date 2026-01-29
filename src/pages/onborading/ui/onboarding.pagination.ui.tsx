import Animated, {
    interpolate,
    interpolateColor,
    SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

interface IProps {
  offset: SharedValue<number>;
  length: number;
}
const PAG_WIDTH = 40;
const PAG_HEIGHT = 10;

export default function OnboardingPagination(props: IProps) {
  const { offset, length } = props;

  const paginations = Array.from({ length }, (_, index) => index);

  const styleInterpolateOutput = paginations.map((i) => i * PAG_WIDTH + i * 8);

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            offset.value,
            paginations,
            styleInterpolateOutput,
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      className={"absolute top-safe mt-8 w-full justify-center items-center"}
    >
      <Animated.View className={"flex-row justify-center items-center gap-2"}>
        {paginations.map((_, index) => {
          return <PaginationItem key={index} index={index} offset={offset} />;
        })}

        <Animated.View
          style={[
            {
              width: PAG_WIDTH,
              height: PAG_HEIGHT,
              borderRadius: 12,
              backgroundColor: "white",
              position: "absolute",
              left: 0,
              opacity: 1,
            },
            style,
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
}

function PaginationItem({
  index,
  offset,
}: {
  index: number;
  offset: IProps["offset"];
}) {
  const style = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        offset.value,
        [index - 1, index, index + 1],
        ["#313131", "white", "#313131"],
      ),
      opacity: interpolate(
        offset.value,
        [index - 1, index, index + 1],
        [1, 0.1, 1],
      ),
      transform: [
        {
          scale: interpolate(
            offset.value,
            [index - 1, index - 1, index, index + 1, index + 1],
            [1, 1, 0.1, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      key={index}
      style={[
        {
          width: PAG_WIDTH,
          height: PAG_HEIGHT,
          borderRadius: 12,
          opacity: 0.8,
          backgroundColor: "#313131",
        },
        style,
      ]}
    />
  );
}
