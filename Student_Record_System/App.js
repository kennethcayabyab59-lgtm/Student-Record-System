import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

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
      <Button title="Login" onPress={() => {}} />
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
      <Button title="Register" onPress={() => {}} />
      <View style={styles.spacer} />
      <Button title="Go to Login" onPress={() => onSwitch('login')} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState('login');

  return screen === 'register' ? (
    <RegisterScreen onSwitch={setScreen} />
  ) : (
    <LoginScreen onSwitch={setScreen} />
  );
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
});
