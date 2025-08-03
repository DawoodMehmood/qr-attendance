import React, { useState, useEffect } from "react";
import {
  View, Text, Alert, ActivityIndicator,
  StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar
} from "react-native";
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter }    from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth }     from "../../src/firebase";
import { checkProximity } from "../../src/utils/geo";
import { Overlay }        from "../../src/components/Overlay";
import { Ionicons }       from "@expo/vector-icons";
import { Stack } from "expo-router";

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  
  useEffect(() => {
    (async () => {
        const { status } = await requestPermission();
        setHasPermission(status === "granted");
    })();
  }, []);

  const finish = () => setTimeout(()=>router.back(), 500);

  const onScan = async ({ data }) => {
    console.log("Scanned data:", data);
    if (scanned) return;
    setScanned(true);
    setLoading(true);
    try {
      // 1) Validate classroom
      const clsSnap = await getDoc(doc(db, "classrooms", data));
      if (!clsSnap.exists()) throw new Error("Invalid QR code.");

      // 2) Check class membership
      const userSnap = await getDoc(doc(db,"users",auth.currentUser.uid));
      if (userSnap.data().classId !== data)
        throw new Error("You do not belong to this classroom.");

      // 3) Geofence
      const coords = clsSnap.data().coords;
      if (!(await checkProximity(coords, 50)))
        throw new Error("You are not in the right classroom.");

      // 4) Once‑per‑day
      const date = new Date().toISOString().split("T")[0];
      const attId = `${date}_${auth.currentUser.uid}`;
      
      const attRef = doc(db, "classrooms", data, "attendance", attId);
      if ((await getDoc(attRef)).exists())
        return Alert.alert("Info","Today's attendance has been recorded already.");
      await setDoc(attRef, {
            uid:       auth.currentUser.uid,
            date,
            timestamp: Date.now(),
        });
    Alert.alert("Success","Attendance recorded!");
    } catch(e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
      router.back();
    }
  };

  if (hasPermission===null) return <ActivityIndicator style={styles.center}/>;
  if (hasPermission===false) return <Text style={styles.center}>No camera</Text>;

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
          <Stack.Screen
      options={{
        title: "Overview",
        headerShown: false,
      }}
    />
    {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <TouchableOpacity style={styles.close} onPress={()=>router.back()}>
        <Ionicons name="close-circle" size={50} color="#fff" />
      </TouchableOpacity>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={
            scanned ? undefined : onScan
        }
        animateShutter={true}
        barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
      />
      <Overlay />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
  close:  { position:"absolute", top:80, right:20, zIndex:10 },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
