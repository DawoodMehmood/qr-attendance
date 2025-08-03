import * as Location from "expo-location";

export async function checkProximity({ lat, lon }, thresholdM = 100) {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") throw new Error("Location denied");
  const { coords } = await Location.getCurrentPositionAsync();
  const toRad = v => (v * Math.PI) / 180;
  const dLat = toRad(coords.latitude - lat);
  const dLon = toRad(coords.longitude - lon);
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(toRad(lat)) *
    Math.cos(toRad(coords.latitude)) *
    Math.sin(dLon/2)**2;
  const dist = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return dist <= thresholdM;
}
