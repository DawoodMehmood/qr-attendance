import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, TouchableWithoutFeedback } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../src/firebase";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ClassListScreen() {
  const [classrooms, setClassrooms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [classroomId, setClassroomId] = useState("");

  const router = useRouter();

  useEffect(() => {
    return onSnapshot(collection(db, "classrooms"), snap => {
      setClassrooms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
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


  return (
    <View style={{ flex: 1, padding: 20, marginBottom: 20 }}>
      <FlatList
        data={classrooms}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => router.push(`/admin/classrooms/${item.id}`)}
          >
            <Text style={styles.title}>Classroom - {item.id}</Text>
          </TouchableOpacity>
        )}
        // contentContainerStyle={{ padding: 20 }}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>

          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>

              <View style={styles.modal}>
                <TouchableOpacity
                  style={styles.closeIcon}
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Classroom ID</Text>
                <Text style={styles.info}>Note: Make sure you are in the center of the room when you press save.</Text>
                <TextInput
                  placeholder="RoomA"
                  value={classroomId}
                  onChangeText={setClassroomId}
                  style={styles.input}
                />
                <View style={styles.modalButtons}>
                  <Button title="Save" onPress={saveClassroom} />
                </View>
              </View>
            </TouchableWithoutFeedback>

          </View>
        </TouchableWithoutFeedback>

      </Modal>
      <Button
        title="Add New Classroom"
        onPress={() => setModalVisible(true)}
      />
    </View>

  );
}
const styles = StyleSheet.create({
  item: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 18, fontWeight: "bold", backgroundColor: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center"
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center"
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 20
  },
  modalButtons: {
    width: "100%",
    marginTop: 15,
  },
  info: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
});
