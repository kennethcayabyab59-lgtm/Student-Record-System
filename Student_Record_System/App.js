import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

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
const db = getFirestore(app);

function getAuthEmail(schoolId) {
  return `${schoolId.toLowerCase()}@school.local`;
}

function parseUserProfile(user) {
  const displayName = user.displayName || '';
  const [rawRole, name, idNumber] = displayName.split(':');

  const role =
    rawRole === 'student' || rawRole === 'professor'
      ? rawRole
      : 'student';

  return {
    role,
    name: name || user.email,
    idNumber: idNumber || '',
  };
}

function createAppUser(firebaseUser) {
  const profile = parseUserProfile(firebaseUser);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    role: profile.role,
    name: profile.name,
    idNumber: profile.idNumber,
  };
}

function HeaderCard() {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.headerTitle}>Student Record System</Text>
      <Text style={styles.headerSubtitle}>
        Modern Student Management
      </Text>
    </View>
  );
}

function CustomButton({ title, onPress, color = '#1565C0' }) {
  return (
    <TouchableOpacity
      style={[styles.customButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.customButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function LoginScreen({ onSwitch }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderCard />

        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <Text style={styles.label}>School ID</Text>
          <TextInput
            value={credential}
            onChangeText={setCredential}
            placeholder="2023-70400"
            style={styles.input}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <CustomButton
            title="Login"
            onPress={() =>
              signInWithEmailAndPassword(
                auth,
                getAuthEmail(credential),
                password
              )
                .then((uc) =>
                  onSwitch('dashboard', createAppUser(uc.user))
                )
                .catch((e) => alert(e.message))
            }
          />

          <CustomButton
            title="Create Account"
            color="#42A5F5"
            onPress={() => onSwitch('register')}
          />
        </View>

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
}

function RegisterScreen({ onSwitch }) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name || !schoolId || !password) {
      alert('Please fill in all fields.');
      return;
    }

    const isProfessor =
      schoolId.toUpperCase().startsWith('PROF-');

    const role = isProfessor ? 'professor' : 'student';

    createUserWithEmailAndPassword(
      auth,
      getAuthEmail(schoolId),
      password
    )
      .then((result) =>
        updateProfile(result.user, {
          displayName: `${role}:${name}:${schoolId}`,
        })
      )
      .then(() => onSwitch('login'))
      .catch((e) => alert(e.message));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderCard />

        <View style={styles.card}>
          <Text style={styles.title}>Register</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            style={styles.input}
          />

          <Text style={styles.label}>School ID</Text>
          <TextInput
            value={schoolId}
            onChangeText={setSchoolId}
            placeholder="2023-70400"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            style={styles.input}
          />

          <CustomButton
            title="Register"
            onPress={handleRegister}
          />

          <CustomButton
            title="Back to Login"
            color="#42A5F5"
            onPress={() => onSwitch('login')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StudentDashboard({ user, record, onLogout }) {
  const studentRecord = record || {
    schoolId: user.idNumber,
    name: user.name,
    course: '',
    block: '',
    yearLevel: '',
    grades: [],
  };

  const gwa = studentRecord.grades.length
    ? (
        studentRecord.grades.reduce(
          (sum, g) => sum + Number(g.grade || 0),
          0
        ) / studentRecord.grades.length
      ).toFixed(2)
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderCard />

        <View style={styles.card}>
          <Text style={styles.title}>Student Dashboard</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              👤 {user.name}
            </Text>

            <Text style={styles.infoText}>
              🆔 {user.idNumber}
            </Text>

            <Text style={styles.infoText}>
              📘 {studentRecord.course}
            </Text>

            <Text style={styles.infoText}>
              🎓 Year {studentRecord.yearLevel}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Grades</Text>

          {studentRecord.grades.map((g, i) => (
            <View key={i} style={styles.gradeCard}>
              <Text style={styles.gradeTitle}>
                {g.subject}
              </Text>

              <Text>Code: {g.code}</Text>
              <Text>Units: {g.units}</Text>
              <Text>Grade: {g.grade}</Text>
              <Text>
                Professor: {g.professorName || 'N/A'}
              </Text>
            </View>
          ))}

          <View style={styles.gwaCard}>
            <Text style={styles.gwaText}>
              GWA: {gwa}
            </Text>
          </View>

          <CustomButton
            title="Logout"
            color="#E53935"
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfessorDashboard({ user, onLogout }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeaderCard />

        <View style={styles.card}>
          <Text style={styles.title}>
            Professor Dashboard
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              👨‍🏫 {user.name}
            </Text>

            <Text style={styles.infoText}>
              🆔 {user.idNumber}
            </Text>

            <Text style={styles.infoText}>
              Role: Professor
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            Manage Students
          </Text>

          <View style={styles.gradeCard}>
            <Text style={styles.gradeTitle}>
              Create and Manage Blocks
            </Text>

            <Text>
              Add students, edit grades, and organize
              records.
            </Text>
          </View>

          <CustomButton
            title="Logout"
            color="#E53935"
            onPress={onLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardScreen({
  user,
  onLogout,
}) {
  const [studentRecord, setStudentRecord] =
    useState(null);

  useEffect(() => {
    if (user.role !== 'student') return;

    getDocs(collection(db, 'blocks'))
      .then((blockSnap) => {
        const blockDocs = blockSnap.docs;

        return Promise.all(
          blockDocs.map((b) =>
            getDocs(
              collection(
                db,
                'blocks',
                b.id,
                'students'
              )
            ).then((studentSnap) =>
              studentSnap.docs.map((s) => ({
                firestoreId: s.id,
                ...s.data(),
                grades: (s.data().grades || []).map(
                  (g) => ({
                    ...g,
                    professorName:
                      b.data().professorName,
                  })
                ),
              }))
            )
          )
        );
      })
      .then((allStudentArrays) => {
        const all = allStudentArrays.flat();

        const matchingRecords = all.filter(
          (s) => s.schoolId === user.idNumber
        );

        if (matchingRecords.length > 0) {
          const mergedRecord = {
            ...matchingRecords[0],
            grades: matchingRecords.flatMap(
              (r) => r.grades || []
            ),
          };

          setStudentRecord(mergedRecord);
        }
      })
      .catch((e) =>
        alert(
          'Failed to load student record: ' +
            e.message
        )
      );
  }, [user]);

  if (user.role === 'professor') {
    return (
      <ProfessorDashboard
        user={user}
        onLogout={onLogout}
      />
    );
  }

  return (
    <StudentDashboard
      user={user}
      record={studentRecord}
      onLogout={onLogout}
    />
  );
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);

  const handleSwitch = (dest, firebaseUser) => {
    if (firebaseUser) setUser(firebaseUser);

    setScreen(dest);
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setScreen('login');
  };

  if (screen === 'register') {
    return (
      <RegisterScreen onSwitch={handleSwitch} />
    );
  }

  if (screen === 'dashboard') {
    return (
      <DashboardScreen
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return <LoginScreen onSwitch={handleSwitch} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },

  headerCard: {
    backgroundColor: '#1565C0',
    padding: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    elevation: 6,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  headerSubtitle: {
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 15,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 18,
    padding: 20,
    borderRadius: 22,
    elevation: 5,
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 20,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    color: '#1565C0',
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#F5F9FF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
  },

  customButton: {
    padding: 15,
    borderRadius: 14,
    marginTop: 10,
    alignItems: 'center',
  },

  customButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 12,
    marginTop: 10,
  },

  infoCard: {
    backgroundColor: '#F5F9FF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 15,
    marginBottom: 8,
    color: '#333',
  },

  gradeCard: {
    backgroundColor: '#F8FBFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: '#1565C0',
  },

  gradeTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginBottom: 8,
  },

  gwaCard: {
    backgroundColor: '#1565C0',
    padding: 18,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },

  gwaText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});