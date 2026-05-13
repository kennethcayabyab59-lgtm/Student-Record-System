import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCG5Kv-6FhNT_3xcQy7gpdCURJuB5wfPyE",
  authDomain: "student-record-system-9f4e7.firebaseapp.com",
  projectId: "student-record-system-9f4e7",
  storageBucket: "student-record-system-9f4e7.firebasestorage.app",
  messagingSenderId: "421064416819",
  appId: "1:421064416819:web:8b248556f0d7bc6254cd46"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function LoginScreen({ onSwitch }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text>Email / ID number</Text>
      <TextInput
        value={credential}
        onChangeText={setCredential}
        autoCapitalize="none"
        placeholder="email@domain.com or ID number"
        style={styles.input}
      />
      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        style={styles.input}
      />
      <Button title="Login" onPress={() => signInWithEmailAndPassword(auth, credential, password).then((uc) => onSwitch('dashboard', uc.user)).catch(e => alert(e.message))} />
      <View style={styles.spacer} />
      <Button title="Go to Register" onPress={() => onSwitch('register')} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function RegisterScreen({ onSwitch }) {
  const [name, setName] = useState('');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        style={styles.input}
      />
      <Text>Email / ID number</Text>
      <TextInput
        value={credential}
        onChangeText={setCredential}
        autoCapitalize="none"
        placeholder="email@example.com or ID number"
        style={styles.input}
      />
      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        style={styles.input}
      />
      <Button title="Register" onPress={() => createUserWithEmailAndPassword(auth, credential, password).then(() => onSwitch('login')).catch(e => alert(e.message))} />
      <View style={styles.spacer} />
      <Button title="Go to Login" onPress={() => onSwitch('login')} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function DashboardScreen({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Dashboard</Text>
        <Text>Logged in as: {user.email}</Text>

        <View style={styles.spacer} />
        <Text style={styles.title}>Student Info</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Name</Text>
          <Text style={styles.tableCell}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>ID Number</Text>
          <Text style={styles.tableCell}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Course</Text>
          <Text style={styles.tableCell}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Year Level</Text>
          <Text style={styles.tableCell}></Text>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.title}>Grades</Text>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Code</Text>
          <Text style={styles.tableCell}>Subject</Text>
          <Text style={styles.tableCell}>Units</Text>
          <Text style={styles.tableCell}>Grade</Text>
        </View>

        <View style={styles.spacer} />
        <Text>GWA: </Text>

        <View style={styles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);

  const handleSwitch = (dest, firebaseUser) => {
    if (firebaseUser) setUser(firebaseUser);
    setScreen(dest);
  };

  if (screen === 'register') return <RegisterScreen onSwitch={handleSwitch} />;
  if (screen === 'dashboard') return <DashboardScreen user={user} onLogout={() => { auth.signOut(); setScreen('login'); }} />;
  return <LoginScreen onSwitch={handleSwitch} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
  spacer: {
    height: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 1,
  },
});