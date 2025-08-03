// src/screens/ClassAttendanceScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../../../src/firebase";
import { useLocalSearchParams } from "expo-router";

export default function ClassAttendanceScreen() {
  const { id: classId } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [records, setRecords]   = useState([]);
  const [dates, setDates]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    // load students
    const unsubUsers = onSnapshot(
      query(collection(db, "users"), where("classId", "==", classId)),
      snap => setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    );

    // load attendance
    const unsubAtt = onSnapshot(
      collection(db, "classrooms", classId, "attendance"),
      snap => {
        const docs = snap.docs.map(d => d.data());
        setRecords(docs);

        // unique dates
        let uniq = Array.from(new Set(docs.map(r => r.date)));
        uniq.sort();

        // ensure today appears
        const today = new Date().toISOString().split("T")[0];
        if (uniq.length === 0 || uniq[uniq.length - 1] !== today) {
          uniq.push(today);
        }

        setDates(uniq);
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubAtt();
    };
  }, []);

  if (loading) return <ActivityIndicator style={styles.center} />;

  // build lookup
  const presentMap = {};
  records.forEach(r => presentMap[`${r.date}_${r.uid}`] = true);

  // helper to format "YYYY-MM-DD" → "DD/MM/YYYY"
  const fmt = (d) => {
    const [y,m,day] = d.split("-");
    return `${day}/${m}/${y[2]}${y[3]}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* HORIZONTAL SCROLL for header + all data rows */}
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            {/* Header Row */}
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.cell, styles.nameCell]}>
                <Text style={styles.headerText}>Student Name</Text>
              </View>
              {dates.map(date => (
                <View key={date} style={[styles.cell, styles.dateCell]}>
                  <Text style={styles.headerText}>{fmt(date)}</Text>
                </View>
              ))}
            </View>

            {/* Data Rows */}
            {students.map(s => (
              <View key={s.uid} style={styles.row}>
                <View style={[styles.cell, styles.nameCell]}>
                  <Text>{s.name}</Text>
                </View>
                {dates.map(date => {
                  const key = `${date}_${s.uid}`;
                  const status = presentMap[key] ? "P" : "A";
                  return (
                    <View key={key} style={[styles.cell, styles.dateCell]}>
                      <Text>{status}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get("window");
const NAME_COL_WIDTH = 140;
const DATE_COL_WIDTH = 100;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  center:    { flex:1, justifyContent:"center", alignItems:"center" },

  row: { flexDirection: "row" },
  cell: {
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },

  headerRow: {
    backgroundColor: "#f7f7f7",
  },
  headerText: {
    fontWeight: "bold",
  },

  nameCell: {
    width: NAME_COL_WIDTH,
    paddingHorizontal: 8,
    backgroundColor: "#f3f3f3",
  },
  dateCell: {
    width: DATE_COL_WIDTH,
    paddingHorizontal: 8,
  },
});