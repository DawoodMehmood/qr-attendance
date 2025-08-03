import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Header() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    setMenuVisible(false);
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {/* Left: hamburger (does nothing for now) */}
      <TouchableOpacity onPress={() => {}} style={styles.iconButton}>
        <Ionicons name="menu" size={35} color="#2196f3" />
      </TouchableOpacity>

      {/* Right: avatar */}
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.iconButton}
      >
        <Ionicons name="person-circle" size={35} color="#2196f3" />
      </TouchableOpacity>

      {/* Logout menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menu}>
                <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                  <Ionicons name="log-out-outline" size={20} color="#2196f3" />
                  <Text style={styles.menuText}>Log out</Text>
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
    height: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  iconButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    marginTop: 56,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 4,
    elevation: 4,
    paddingVertical: 8,
    width: 140,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
});
