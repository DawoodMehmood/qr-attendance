// src/components/CameraOverlay.js
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const CUTOUT_SIZE = width * 0.6;

export function Overlay() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Top */}
      <View style={[styles.bar, { flex: 1 }]} />
      {/* Middle row: left bar, cutout, right bar */}
      <View style={{ flexDirection: "row" }}>
        <View style={styles.bar} />
        <View style={styles.cutout} />
        <View style={styles.bar} />
      </View>
      {/* Bottom */}
      <View style={[styles.bar, { flex: 1 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
  },
  cutout: {
    width: CUTOUT_SIZE,
    height: CUTOUT_SIZE,
  },
});
