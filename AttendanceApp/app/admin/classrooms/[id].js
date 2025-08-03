// src/screens/ClassDetailScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Button,
  Modal,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Image,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ClassDetailScreen() {
  const { id: classId } = useLocalSearchParams();
  const [qrVisible, setQrVisible] = useState(false);
  const [uri, setUri] = useState(null);
  const qrRef = useRef();
  const router = useRouter();
  
   // generate a data‑URL for a QR from Google Charts
   const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(classId)}&size=200`;

  async function shareQrPdf() {
    try {
      const html = `
        <html>
          <body style="display:flex;flex-direction: column;justify-content:center;align-items:center;height:100vh;margin:0">
            <h2 style="text-align:center; font-size:36">Classroom - ${classId}</h2>
            <img src="${qrUrl}" style="width:500px;height:500px" />
          </body>
        </html>
      `;
      
      // 1) Generate PDF to a temp file
      const { uri: tempUri } = await Print.printToFileAsync({
        html,
        width: 612,
        height: 792,
      });

      // 2) Build the new path with your classId as filename
      const newUri = FileSystem.documentDirectory + `Classroom - ${classId}.pdf`;

      // 3) Move (or copy) the PDF to that path
      await FileSystem.moveAsync({
        from: tempUri,
        to: newUri,
      });

      // 4) Share the renamed file
      await shareAsync(newUri, { mimeType: "application/pdf" });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Button title="Show QR" onPress={() => setQrVisible(true)} />
      <Button
        title="See Students"
        onPress={() => router.push(`./${classId}/students`)}
      />
      <Button
        title="See Attendance"
        onPress={() => router.push(`./${classId}/attendance`)}
      />

      <Modal
        visible={qrVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setQrVisible(false)}
      >
        {/* Tapping this closes the modal */}
        <TouchableWithoutFeedback onPress={() => setQrVisible(false)}>
          <View style={styles.backdrop}>
            {/* Prevent taps on the modal content from closing */}
            <TouchableWithoutFeedback>
              <View style={styles.modal}>
                {/* Cross icon in top-right */}
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setQrVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={styles.title}>Classroom: {classId}</Text>
                {/* <Image source={{ uri: qrUrl }} style={styles.qrImage} /> */}
                <QRCode
                  value={classId}
                  size={200}
                  getRef={(c) => (qrRef.current = c)}
                />
                
                <TouchableOpacity style={styles.shareButton} onPress={shareQrPdf}>
                  <Ionicons name="share-outline" size={20} color="#fff" />
                  <Text style={styles.shareButtonText}>Share QR</Text>
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  buttons: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 20,
  },
  shareButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
});
