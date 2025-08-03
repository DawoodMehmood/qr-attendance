import { Stack } from "expo-router";
import Header from "../src/components/Header";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
        // show back arrow on nested routes
        headerBackVisible: true
      }}
    />
  );
}
