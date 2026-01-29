import { Dimensions, Pressable, StyleSheet, View } from "react-native";
import { WelcomeBackground } from "./welcome.background.ui";

import {
  BackdropBlur,
  Canvas,
  Image,
  useImage,
} from "@shopify/react-native-skia";
import { router } from "expo-router";
import { useEffect } from "react";
import Animated, {
  FadeIn,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FADE_IN_DURATION = 1000;

const { width, height } = Dimensions.get("screen");

const Images = () => {
  const insets = useSafeAreaInsets();

  const image = useImage(require("../../shared/assets/image/reze1.webp"));

  const blur = useSharedValue(40);

  useEffect(() => {
    blur.value = withDelay(FADE_IN_DURATION, withTiming(0, { duration: 250 }));
  }, []);

  return (
    <Animated.View
      pointerEvents={"none"}
      entering={FadeIn.duration(FADE_IN_DURATION)}
      className="flex-1 items-center justify-center "
      style={{
        ...StyleSheet.absoluteFillObject,

        animationFillMode: "both",
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: "alternate-reverse",
        padding: 4,
        borderRadius: 12,
        animationName: {
          from: {
            transform: [
              {
                translateY: 0,
              },
              {
                rotate: "0deg",
              },
            ],
          },
          to: {
            transform: [
              {
                translateY: 2,
              },
              {
                rotate: "1deg",
              },
            ],
          },
        },
        animationDuration: FADE_IN_DURATION,
      }}
    >
      <Canvas
        style={{
          width: width,
          height: height,
        }}
      >
        <Image
          image={image}
          x={0}
          y={insets.top}
          width={width}
          height={height - insets.top - insets.bottom}
          fit="cover"
        />
        <BackdropBlur blur={blur} clip={{ x: 0, y: 0, width, height }} />
      </Canvas>
    </Animated.View>
  );
};

const NextBtn = () => {
  return (
    <Animated.View
      className={"absolute bottom-safe-offset-12 w-full"}
      style={{
        animationFillMode: "both",
        animationTimingFunction: "linear",
        animationDuration: 250,
        animationDelay: 2000,
        animationName: {
          from: {
            transform: [
              {
                translateY: 100,
              },
            ],
            opacity: 0,
          },
          to: {
            transform: [
              {
                translateY: 0,
              },
            ],
            opacity: 1,
          },
        },
      }}
    >
      <Pressable
        className={"flex-row justify-center items-center gap-2"}
        onPress={() => {
          router.replace("/onboarding");
        }}
      >
        {"Lets start".split("").map((i, index) => {
          return (
            <Animated.Text
              style={{
                fontSize: 24,
                color: "white",
                fontWeight: "500",
                animationFillMode: "both",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDirection: "alternate-reverse",
                padding: 4,
                borderRadius: 12,
                animationName: {
                  from: {
                    transform: [
                      {
                        scale: 0.8,
                      },
                    ],
                  },
                  to: {
                    transform: [
                      {
                        scale: 1.2,
                      },
                    ],
                  },
                },
                animationDuration: 1500 + index * 250,
              }}
              key={index}
            >
              {i}
            </Animated.Text>
          );
        })}
      </Pressable>
    </Animated.View>
  );
};

const Welcome = () => {
  return (
    <Animated.View
      className={"absolute top-[40%] flex-col gap-8 left-4 right-4"}
    >
      <Animated.View className={"flex-row gap-2"}>
        {"Welcome".split("").map((i, index) => {
          return (
            <Animated.Text
              key={index}
              style={{
                color: "white",
                fontSize: 42,
                fontWeight: "900",
                animationFillMode: "both",
                animationDuration: 250 + index * 150,
                animationName: {
                  from: {
                    opacity: 0,
                  },
                  to: {
                    opacity: 1,
                  },
                },
              }}
            >
              {i}
            </Animated.Text>
          );
        })}
      </Animated.View>

      <Animated.View className={"flex-row flex-wrap"}>
        {"Create vibrant stories that capture attention and stay memorable"
          .split("")
          .map((i, index) => {
            return (
              <Animated.Text
                key={index}
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "500",
                  animationFillMode: "both",
                  animationDuration: index * 150,
                  animationName: {
                    from: {
                      opacity: 0,
                    },
                    to: {
                      opacity: 1,
                    },
                  },
                }}
              >
                {i}
              </Animated.Text>
            );
          })}
      </Animated.View>
    </Animated.View>
  );
};

export const WelcomeScreen = () => {
  return (
    <View className="flex-1">
      <WelcomeBackground />
      <Images />

      <Welcome />

      <NextBtn />
    </View>
  );
};
