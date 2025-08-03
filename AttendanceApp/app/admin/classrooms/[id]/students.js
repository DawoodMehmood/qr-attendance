import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, TextInput, Alert, StyleSheet } from "react-native";
import { collection, query, where, onSnapshot, setDoc, doc } from "firebase/firestore";
import { db, auth } from "../../../../src/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useLocalSearchParams } from "expo-router";

export default function StudentTable() {
  const { id: classId } = useLocalSearchParams();
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    const q = query(collection(db,"users"), where("classId","==",classId));
    return onSnapshot(q,snap=>{
      setStudents(snap.docs.map(d=>({ uid:d.id, ...d.data() })));
    });
  },[]);

  async function addStudent() {
    if (!name.trim()) return Alert.alert("Name required");
    const email = `${name.replace(/\s+/g,"").toLowerCase()}@uni.edu`;
    const password = "Password123";
    try {
      const { user } = await createUserWithEmailAndPassword(auth,email,password);
      // store profile
      await setDoc(doc(db,"users",user.uid),{
        name, email, classId, isAdmin:false
      });
      setName("");
    } catch(e){ Alert.alert("Error",e.message); }
  }

  return (
    <View style={[styles.container, { flex: 1 }]}>
        <TextInput
          placeholder="Student Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Button title="Add Student" onPress={addStudent} />
        <Text style={{fontSize:20, marginVertical:16, textAlign:"center"}}>All Students</Text>
      <FlatList
        data={students}
        keyExtractor={s=>s.uid}
        renderItem={({item})=>(
          <View style={styles.row}>
            <Text>{item.name}</Text><Text>{item.email}</Text>
          </View>
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}
const styles=StyleSheet.create({
  container:{flex:1,padding:20},
  row:{flexDirection:"row",justifyContent:"space-between",padding:8},
  input:{borderWidth:1,borderColor:"#ccc",padding:8,marginVertical:12}
});
