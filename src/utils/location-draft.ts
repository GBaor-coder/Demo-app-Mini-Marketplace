import { LocationPoint } from '@/src/types';

let draft: LocationPoint | null = null;

export function setLocationDraft(location: LocationPoint) {
  draft = location;
}

export function takeLocationDraft(): LocationPoint | null {
  const value = draft;
  draft = null;
  return value;
}
