import { Redirect } from 'expo-router';

import { LoadingScreen } from '@/src/components/ui';
import { useStore } from '@/src/context/store-context';

export default function EntryScreen() {
  const { currentUser, hydrated } = useStore();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  return <Redirect href={currentUser ? '/(tabs)' : '/login'} />;
}
