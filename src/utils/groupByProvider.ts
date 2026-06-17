type PlayerOption = {
  id: string;
  title: string;
  post: string;
  action: string;
  nume: string;
  type: string;
  video: string;
};

// Minimal type for grouping - only requires title which is what we use
type VideoOption = {
  title: string;
  [key: string]: any; // Allow other properties
};

type GroupedPlayerOptions<T extends VideoOption = VideoOption> = Record<string, T[]>;

function groupByProvider<T extends VideoOption>(options: T[]): GroupedPlayerOptions<T> {
  const result: GroupedPlayerOptions<T> = {} as GroupedPlayerOptions<T>;

  options.forEach((option) => {
    const provider = option.title.split(" ")[0];

    if (!result[provider]) {
      result[provider] = [];
    }

    result[provider].push(option);
  });

  return result;
}

export default groupByProvider;
