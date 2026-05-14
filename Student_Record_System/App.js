import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

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

function getAuthEmail(schoolId) {
  return `${schoolId.toLowerCase()}@school.local`;
}

const initialStudentRecords = [
  {
    id: 'S001',
    schoolId: '2023-70400',
    name: 'June Kenneth',
    course: 'BSIT',
    block: 'A1',
    yearLevel: '2',
    grades: [
      { code: 'IT101', subject: 'Programming 1', units: '3', grade: '1.75' },
      { code: 'MA101', subject: 'Calculus', units: '3', grade: '2.00' },
    ],
  },
  {
    id: 'S002',
    schoolId: '2023-70401',
    name: 'Jhon Jorros',
    course: 'BSCS',
    block: 'B2',
    yearLevel: '1',
    grades: [
      { code: 'CS101', subject: 'Computer Org', units: '3', grade: '2.25' },
      { code: 'EN101', subject: 'English', units: '3', grade: '1.50' },
    ],
  },
];

function parseUserProfile(user) {
  const displayName = user.displayName || '';
  const [rawRole, name, idNumber] = displayName.split(':');
  const role = rawRole === 'student' || rawRole === 'professor' ? rawRole : 'student';
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

function LoginScreen({ onSwitch }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text>School ID</Text>
      <TextInput
        value={credential}
        onChangeText={setCredential}
        autoCapitalize="none"
        placeholder="2023-70400"
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
      <Button
        title="Login"
        onPress={() =>
          signInWithEmailAndPassword(auth, getAuthEmail(credential), password)
            .then((uc) => onSwitch('dashboard', createAppUser(uc.user)))
            .catch((e) => alert(e.message))
        }
      />
      <View style={styles.spacer} />
      <Button title="Go to Register" onPress={() => onSwitch('register')} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function RegisterScreen({ onSwitch }) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const handleRegister = () => {
    if (!name || !schoolId || !password) {
      alert('Please fill in all fields.');
      return;
    }

    createUserWithEmailAndPassword(auth, getAuthEmail(schoolId), password)
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
      <Text style={styles.title}>Register</Text>
      <Text>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        style={styles.input}
      />
      <Text>School ID</Text>
      <TextInput
        value={schoolId}
        onChangeText={setSchoolId}
        autoCapitalize="none"
        placeholder="2023-70400"
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
      <Text style={styles.subTitle}>Select Role</Text>
      <View style={styles.roleRow}>
        <Pressable
          style={[styles.roleOption, role === 'student' && styles.roleOptionActive]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleOptionText, role === 'student' && styles.roleOptionTextActive]}>Student</Text>
        </Pressable>
        <Pressable
          style={[styles.roleOption, role === 'professor' && styles.roleOptionActive]}
          onPress={() => setRole('professor')}
        >
          <Text style={[styles.roleOptionText, role === 'professor' && styles.roleOptionTextActive]}>Professor</Text>
        </Pressable>
      </View>
      <View style={styles.spacer} />
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.spacer} />
      <Button title="Go to Login" onPress={() => onSwitch('login')} />
      <StatusBar style="auto" />
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
    ? (studentRecord.grades.reduce((sum, grade) => sum + Number(grade.grade || 0), 0) / studentRecord.grades.length).toFixed(2)
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Student Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Student</Text>
        <Text>School ID: {user.idNumber}</Text>
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Student Info</Text>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Name</Text>
          <Text style={styles.tableCell}>{user.name}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>ID</Text>
          <Text style={styles.tableCell}>{studentRecord.id || ''}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Course</Text>
          <Text style={styles.tableCell}>{studentRecord.course}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Block</Text>
          <Text style={styles.tableCell}>{studentRecord.block}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Year</Text>
          <Text style={styles.tableCell}>{studentRecord.yearLevel}</Text>
        </View>

        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Grades</Text>
        <View style={[styles.tableRow, styles.headerRow]}>
          <Text style={styles.tableCell}>Code</Text>
          <Text style={styles.tableCell}>Subject</Text>
          <Text style={styles.tableCell}>Units</Text>
          <Text style={styles.tableCell}>Grade</Text>
        </View>
        {studentRecord.grades.map((grade, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{grade.code}</Text>
            <Text style={styles.tableCell}>{grade.subject}</Text>
            <Text style={styles.tableCell}>{grade.units}</Text>
            <Text style={styles.tableCell}>{grade.grade}</Text>
          </View>
        ))}
        <View style={styles.spacer} />
        <Text>GWA: {gwa}</Text>

        <View style={styles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfessorDashboard({ user, records, setRecords, onLogout }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const startEditing = (record) => {
    setSelectedRecord({ ...record, grades: record.grades.map((grade) => ({ ...grade })) });
  };

  const saveChanges = () => {
    if (!selectedRecord) return;
    setRecords((prev) => prev.map((rec) => (rec.id === selectedRecord.id ? selectedRecord : rec)));
    setSelectedRecord(null);
  };

  const updateField = (field, value) => {
    setSelectedRecord((prev) => ({ ...prev, [field]: value }));
  };

  const updateGrade = (index, field, value) => {
    setSelectedRecord((prev) => {
      const gradeList = [...prev.grades];
      gradeList[index] = { ...gradeList[index], [field]: value };
      return { ...prev, grades: gradeList };
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Professor Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Professor</Text>
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Students</Text>
        {records.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <Text style={styles.boldText}>{record.name}</Text>
            <Text>School ID: {record.schoolId}</Text>
            <Text>Internal ID: {record.id}</Text>
            <Text>Course: {record.course}</Text>
            <Text>Block: {record.block}</Text>
            <Text>Year: {record.yearLevel}</Text>
            <View style={styles.editButton}>
              <Button title="Edit" onPress={() => startEditing(record)} />
            </View>
          </View>
        ))}

        {selectedRecord && (
          <>
            <View style={styles.spacer} />
            <Text style={styles.sectionTitle}>Edit Student</Text>
            <Text>Name</Text>
            <TextInput
              value={selectedRecord.name}
              onChangeText={(value) => updateField('name', value)}
              style={styles.input}
            />
            <Text>Course</Text>
            <TextInput
              value={selectedRecord.course}
              onChangeText={(value) => updateField('course', value)}
              style={styles.input}
            />
            <Text>Block</Text>
            <TextInput
              value={selectedRecord.block}
              onChangeText={(value) => updateField('block', value)}
              style={styles.input}
            />
            <Text>Year Level</Text>
            <TextInput
              value={selectedRecord.yearLevel}
              onChangeText={(value) => updateField('yearLevel', value)}
              style={styles.input}
            />

            <Text style={styles.subTitle}>Grades</Text>
            {selectedRecord.grades.map((grade, index) => (
              <View key={index} style={styles.gradeRow}>
                <TextInput
                  value={grade.code}
                  onChangeText={(value) => updateGrade(index, 'code', value)}
                  placeholder="Code"
                  style={[styles.input, styles.gradeInput]}
                />
                <TextInput
                  value={grade.subject}
                  onChangeText={(value) => updateGrade(index, 'subject', value)}
                  placeholder="Subject"
                  style={[styles.input, styles.gradeInput]}
                />
                <TextInput
                  value={grade.units}
                  onChangeText={(value) => updateGrade(index, 'units', value)}
                  placeholder="Units"
                  style={[styles.input, styles.gradeInput]}
                />
                <TextInput
                  value={grade.grade}
                  onChangeText={(value) => updateGrade(index, 'grade', value)}
                  placeholder="Grade"
                  style={[styles.input, styles.gradeInput]}
                />
              </View>
            ))}

            <Button title="Save Changes" onPress={saveChanges} />
            <View style={styles.spacer} />
            <Button title="Cancel" onPress={() => setSelectedRecord(null)} />
          </>
        )}

        <View style={styles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardScreen({ user, records, setRecords, onLogout }) {
  const record = records.find((item) => item.schoolId === user.idNumber || item.id === user.idNumber);

  if (user.role === 'professor') {
    return <ProfessorDashboard user={user} records={records} setRecords={setRecords} onLogout={onLogout} />;
  }

  return <StudentDashboard user={user} record={record} onLogout={onLogout} />;
}

export default function App() {
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState(initialStudentRecords);

  const handleSwitch = (dest, firebaseUser) => {
    if (firebaseUser) setUser(firebaseUser);
    setScreen(dest);
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setScreen('login');
  };

  if (screen === 'register') return <RegisterScreen onSwitch={handleSwitch} />;
  if (screen === 'dashboard') return <DashboardScreen user={user} records={records} setRecords={setRecords} onLogout={handleLogout} />;
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
  subTitle: {
    marginTop: 12,
    marginBottom: 8,
    fontSize: 18,
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
  headerRow: {
    backgroundColor: '#f2f2f2',
  },
  tableCell: {
    flex: 1,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#0057d9',
  },
  roleOptionText: {
    color: '#333',
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: '#fff',
  },
  recordCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  boldText: {
    fontWeight: '700',
    marginBottom: 4,
  },
  editButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  gradeRow: {
    marginBottom: 12,
  },
  gradeInput: {
    marginBottom: 8,
  },
});