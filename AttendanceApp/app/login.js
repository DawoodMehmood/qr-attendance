import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { auth, db }        from "../src/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc, getDoc
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);


  async function handleLogin() {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, pass);
    //   Alert.alert("Success", "Logged in!");
      // Fetch profile to check admin flag
      const userRef  = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      if (userData.isAdmin) {
        router.replace("/admin/classrooms");
      } else {
        router.replace("/student/attendance");
      }
    } catch (e) {
      Alert.alert("Login Error", e.message);
    }
  }

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>
      <TextInput
        placeholder="CMS Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth:1, marginBottom:12, borderColor:"#ccc" }}
      />
       <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPass}
          value={pass}
          onChangeText={setPass}
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity
          onPress={() => setShowPass(v => !v)}
          style={styles.eyeButton}
        >
          <Ionicons
            name={showPass ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    input: {
      borderColor: "#ccc",
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderColor: "#ccc",
      marginBottom: 20,
    },
    eyeButton: {
      padding: 8,
    },
  });