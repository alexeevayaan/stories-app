import { View } from "react-native";
import Animated from "react-native-reanimated";
import { IOnboardingDomain } from "./onboarding.domain";
import {
  OnboardingBackground,
  OnboardingButton,
  OnboardingItem,
  OnboardingPagination,
} from "./ui";
import { useGetScrollOffset } from "./usecase/use_get_scrollOffset";

const image =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkbVgPZ16v73ROeLxNHQTD8Ky4j8HAizzukg&s";

const items: IOnboardingDomain[] = [
  {
    title: "Create vibrant stories",
    description:
      "Design eye-catching stories that capture attention and stay memorable.",
    image_url:
      "https://wallpapers-clan.com/wp-content/uploads/2025/12/chainsaw-man-reze-underwater-smile-desktop-wallpaper-preview.jpg",
  },
  {
    title: "Add motion & style",
    description:
      "Use animations, effects, and fonts to make your stories come alive.",
    image_url:
      "https://wallpaper.forfun.com/fetch/96/96a0a8bfd09c15bde7a1b9416ff4f713.jpeg",
  },
  {
    title: "Edit in minutes",
    description: "Create beautiful stories fast — no design skills required.",
    image_url:
      "https://motionbgs.com/media/9062/reze-last-summer.3840x2160.jpg",
  },
  {
    title: "Share instantly",
    description: "Export and share your stories to social media with one tap.",
    image_url: "https://play.vsthemes.org/frame/93/73093.webp",
  },
];

export function OnboardingScreen() {
  const { scrollOffsetValue, scrollRef } = useGetScrollOffset({
    length: items.length,
  });

  const renderItem = ({
    item,
    index,
  }: {
    item: IOnboardingDomain;
    index: number;
  }) => {
    return (
      <OnboardingItem item={item} index={index} offset={scrollOffsetValue} />
    );
  };

  return (
    <View className="flex-1 ">
      <OnboardingBackground offset={scrollOffsetValue} />
      <OnboardingPagination offset={scrollOffsetValue} length={items.length} />
      <Animated.FlatList
        ref={scrollRef}
        horizontal
        data={items}
        keyExtractor={(_, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        pagingEnabled
        renderItem={renderItem}
      />
      <OnboardingButton offset={scrollOffsetValue} length={items.length} />
    </View>
  );
}
