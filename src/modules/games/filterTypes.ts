export const PROGRESSES = ["wont-play", "never-played", "unfinished", "beaten", "completed", "uncategorized"] as const;
export type Progress = (typeof PROGRESSES)[number];

export const PROGRESS_LABELS: Record<Progress, string> = {
  "wont-play": "won't play",
  "never-played": "never played",
  unfinished: "unfinished",
  beaten: "beaten",
  completed: "completed",
  uncategorized: "uncategorized",
};

export type FilterOption = { label: string; value: string; color: string; sortValue?: number };

export type Filters = {
  modes: FilterOption[];
  tags: FilterOption[];
  steamTags: FilterOption[];
  protonDbRatings: FilterOption[];
  deviceStatuses: Record<CompatibilityDeviceId, FilterOption[]>;
};

export type DeviceFilter = { id: CompatibilityDeviceId; placeholder: string; options: FilterOption[] };

export type GameStats = { [key in Progress]: number } & { [key in `${Progress}-percent`]: string } & { total: number };
