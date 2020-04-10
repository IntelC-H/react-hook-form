import isArray from './isArray';

export default function prepend<T>(data: T[]): (T | null)[];
export default function prepend<T>(data: T[], value: T | T[]): T[];
export default function prepend<T>(data: T[], value?: T | T[]): (T | null)[] {
  return [...(isArray(value) ? value : [value || null]), ...data];
}
