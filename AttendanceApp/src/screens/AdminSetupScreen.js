// src/screens/AdminSetupScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share
} from "react-native";
import * as Location from "expo-location";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import QRCode from "react-native-qrcode-svg";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";


export default function AdminSetupScreen() {
  const [loading, setLoading]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [classroomId, setClassroomId]   = useState("");
  const [classrooms, setClassrooms]     = useState([]);
  const [qrModal, setQrModal]           = useState(null); // { id, coords }
  const qrRef = useRef();

  // Subscribe to classrooms collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classrooms"), (snap) => {
      setClassrooms(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
    return unsub;
  }, []);

  async function saveClassroom() {
    if (!classroomId.trim()) {
      Alert.alert("Error", "Classroom ID is required.");
      return;
    }
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied");
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync();
      await setDoc(doc(db, "classrooms", classroomId.trim()), {
        coords: { lat: coords.latitude, lon: coords.longitude },
        recordedAt: Date.now(),
      });
      setModalVisible(false);
      setClassroomId("");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  }

  function openQrModal(item) {
    setQrModal(item);
  }

  async function shareQr() {
    try {
      // 1) Get the QR as a base64 PNG
      qrRef.current.toDataURL(async (base64Data) => {
        // 2) Build a minimal HTML wrapping the image
        const html = `
          <html>
            <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0">
              <img src="data:image/png;base64,${base64Data}" style="width:250px;height:250px;" />
            </body>
          </html>
        `;
  
        // 3) Render it to a PDF file
        const { uri: pdfUri } = await Print.printToFileAsync({
          html,
          width: 612,   // 8.5"×72dpi
          height: 792,  // 11"×72dpi
          base64: false
        });
  
        // 4) Share the PDF
        await shareAsync(pdfUri, { mimeType: "application/pdf" });
      });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  }
  

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View>
        <Text style={styles.itemTitle}>{item.id}</Text>
        <Text style={styles.itemSub}>
          {new Date(item.recordedAt).toLocaleString()}
        </Text>
      </View>
      <Button title="Show QR" onPress={() => openQrModal(item)} />
    </View>
  );

  return (
    <View style={styles.container}>
      

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

      <FlatList
        data={classrooms}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 20 }}
      />

      {/* New Classroom Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Classroom ID</Text>
            <Text style={styles.info}>Make sure you are in the center of the room when you press save.</Text>
            <TextInput
              placeholder="RoomA"
              value={classroomId}
              onChangeText={setClassroomId}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save"   onPress={saveClassroom} />
            </View>
          </View>
        </View>
      </Modal>

      {/* QR Code & Share Modal */}
      <Modal
        visible={!!qrModal}
        animationType="fade"
        transparent
        onRequestClose={() => setQrModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            {qrModal && (
              <>
                <Text style={styles.modalTitle}>{qrModal.id}</Text>
                <QRCode
                  value={qrModal.id}
                  size={200}
                  getRef={c => (qrRef.current = c)}
                />
                <View style={styles.modalButtons}>
                    
                <Button title="Share QR" onPress={shareQr} />
                <Button title="Close" onPress={() => setQrModal(null)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Button
        title="Add New Classroom"
        onPress={() => setModalVisible(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20 },
  item: {
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    padding:12,
    borderBottomWidth:1,
    borderColor:"#eee"
  },
  itemTitle: { fontSize:16 },
  itemSub:   { color:"#666", marginTop:4 },
  modalBackdrop: {
    flex:1,
    backgroundColor:"rgba(0,0,0,0.5)",
    justifyContent:"center",
    padding:20
  },
  modal: {
    backgroundColor:"#fff",
    borderRadius:8,
    padding:20,
    alignItems:"center"
  },
  modalTitle: {
    fontSize:18,
    marginBottom:12,
    textAlign:"center"
  },
  input: {
    width:"100%",
    borderWidth:1,
    borderColor:"#ccc",
    borderRadius:4,
    padding:8,
    marginBottom:20
  },
  modalButtons: {
    flexDirection:"row",
    justifyContent:"space-between",
    width:"100%",
    marginTop:20
  },
  info:{
    fontSize:12,
    color:"#666",
    marginBottom:20
  }
});
