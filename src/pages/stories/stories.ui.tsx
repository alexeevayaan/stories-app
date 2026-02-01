import { useSharedValue } from "react-native-reanimated";
import { Item, StoriesEdit, StoriesLayout, StoriesPanel } from "./ui";
import { ILayout, type IStory, useStories } from "./usecase";

export function StoriesScreen() {
  const wrapperLayout = useSharedValue<ILayout>({
    width: 0,
    height: 0,
  });

  const storiesServise = useStories();

  const focusedId = useSharedValue<string>("");

  const renderItem = (i: IStory) => {
    return (
      <Item
        key={i.id}
        id={i.id}
        focusedId={focusedId}
        wrapperLayout={wrapperLayout}
      />
    );
  };

  return (
    <StoriesLayout layout={wrapperLayout}>
      <StoriesPanel create={storiesServise.create} />
      {storiesServise.stories.map(renderItem)}
      <StoriesEdit focusedId={focusedId} />
    </StoriesLayout>
  );
}
