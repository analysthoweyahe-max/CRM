export interface MentionRef {
  type: string;
  id:   string;
}

export interface ResolvedMention {
  id:             string;
  type:           string;
  name:           string;
  avatarUrl?:     string | null;
  avatarInitial?: string;
  roleLabel?:     string | null;
}
