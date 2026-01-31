import { useState } from "react";

type storyType = "text" | "image";

interface IStory {
  id: string;
  type: storyType;
}

export function NewStory(type: storyType) {
  return {
    id: new Date().toISOString(),
    type,
  };
}

const useStories = () => {
  const [stories, setStories] = useState<IStory[]>([]);

  const create = (type: storyType) => {
    setStories((prev) => [...prev, NewStory(type)]);
  };

  return { stories, create };
};

export default useStories;
