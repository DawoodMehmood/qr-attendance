// src/screens/StudentAttendanceScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Button,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions
} from "react-native";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../src/firebase";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function StudentAttendanceScreen() {
  const [dates, setDates]       = useState([]);      // all class dates
  const [presentMap, setPresentMap] = useState({});  // { "YYYY-MM-DD_uid": true }
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const router = useRouter();
  const uid    = auth.currentUser.uid;

  useEffect(() => {
    let unsubAtt;
    // 1) Fetch this student’s classId
    getDoc(doc(db, "users", uid))
      .then(userSnap => {
        if (!userSnap.exists()) throw new Error("User profile missing");
        const classId = userSnap.data().classId;
        if (!classId) throw new Error("No class assigned");

        // 2) Subscribe to class attendance
        unsubAtt = onSnapshot(
          collection(db, "classrooms", classId, "attendance"),
          snap => {
            const docs = snap.docs.map(d => d.data());
            // unique, sorted dates
            let uniq = Array.from(new Set(docs.map(r => r.date))).sort();
            // always include today
            const today = new Date().toISOString().split("T")[0];
            if (!uniq.length || uniq[uniq.length - 1] !== today) {
              uniq.push(today);
            }
            // build presence map
            const pm = {};
            docs.forEach(r => {
              pm[`${r.date}_${r.uid}`] = true;
            });
            setDates(uniq);
            setPresentMap(pm);
            setLoading(false);
          },
          err => {
            setError(err.message);
            setLoading(false);
          }
        );
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });

    return () => unsubAtt && unsubAtt();
  }, []);

  // helper: "YYYY-MM-DD" → "DD/MM/YYYY"
  const fmt = d => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error)   return <Text style={[styles.center, styles.error]}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Attendance</Text>
      
      <View style={styles.headerRow}>
        <Text style={[styles.cell, styles.headerText, styles.dateCell]}>Date</Text>
        <Text style={[styles.cell, styles.headerText, styles.statusCell]}>P/A</Text>
      </View>
      <FlatList
        data={dates}
        keyExtractor={d => d}
        renderItem={({ item: date }) => {
          const status = presentMap[`${date}_${uid}`] ? "P" : "A";
          return (
            <View style={styles.row}>
              <Text style={[styles.cell, styles.dateCell]}>{fmt(date)}</Text>
              <Text style={[styles.cell, styles.statusCell]}>{status}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/student/scan")}
        >
          <Ionicons name="qr-code-outline" size={40} color="#2196f3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const BAR_HEIGHT = 70;
const FAB_SIZE = 70;
const { width } = Dimensions.get("window");


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    textAlign: "center",
    padding: 20,
  },
  error: {
    color: "red",
  },
  title: {
    fontSize: 24,
    marginVertical: 30,
    textAlign: "center",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  cell: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "bold",
  },
  dateCell: {
    flex: 2,    // you can tweak these ratios
  },
  statusCell: {
    flex: 1,
    textAlign: "center",
  },
  bottomBar: {
    position:"absolute",
    bottom:0, left:0, right:0,
    height: BAR_HEIGHT,
    backgroundColor: "#2196f3",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position:"absolute",
    top: -FAB_SIZE/2,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE/2,
    backgroundColor: "#fff",
    alignItems:"center",
    justifyContent:"center",
    elevation:5,            // Android shadow
    shadowColor:"#000",     // iOS shadow
    shadowOffset:{width:0, height:2},
    shadowOpacity:0.3,
    shadowRadius:4,
  }
});
