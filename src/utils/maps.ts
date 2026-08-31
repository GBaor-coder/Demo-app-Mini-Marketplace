import { Linking, Platform } from 'react-native';

export async function openMapLink(latitude: number, longitude: number) {
  const geoUrl = `geo:${latitude},${longitude}?q=${latitude},${longitude}`;
  const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  const open = async (url: string) => {
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // ignore and fall through
    }
    return false;
  };

  if (Platform.OS === 'android') {
    const opened = await open(geoUrl);
    if (opened) return;
    await open(webUrl);
    return;
  }

  await open(webUrl);
}
