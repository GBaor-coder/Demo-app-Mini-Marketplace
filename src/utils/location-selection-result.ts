import { LocationPoint } from '@/src/types';

let pendingLocation: LocationPoint | null = null;

export function setLocationSelectionResult(location: LocationPoint) {
  pendingLocation = location;
}

export function consumeLocationSelectionResult() {
  const location = pendingLocation;
  pendingLocation = null;
  return location;
}
