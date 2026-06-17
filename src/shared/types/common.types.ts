export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
