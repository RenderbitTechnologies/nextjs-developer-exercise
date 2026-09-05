export const POSTS_PER_PAGE = 8;

export const SUBTITLE_MAX_WORDS = 60;
export const SUBTITLE_MAX_CHARS = 360;

export const RESERVED_USERNAMES = [
  "admin",
  "signin",
  "signup",
  "settings",
  "api",
  "search",
] as const;

export const reservedUsernameSet = new Set<string>(RESERVED_USERNAMES);

export const DEFAULT_COVER =
  "https://n9bs18fdp4.ufs.sh/f/F6okHHeGON7K5lFH4H0mubQasWlKh7yYXFBf2MHrcnS0EdtL";
