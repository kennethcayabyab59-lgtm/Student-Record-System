import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Pressable, Button } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
  const role = rawRole === 'student' || rawRole === 'professor' ? rawRole : 'student';
  return { role, name: name || user.email, idNumber: idNumber || '' };
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

function AuthButton({ title, onPress, variant = 'primary' }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        authStyles.button,
        variant === 'primary' ? authStyles.primaryButton : authStyles.secondaryButton,
        pressed && authStyles.buttonPressed,
      ]}
    >
      <Text style={[authStyles.buttonText, variant === 'primary' ? authStyles.primaryButtonText : authStyles.secondaryButtonText]}>
        {title}
      </Text>
    </Pressable>
  );
}

function LoginScreen({ onSwitch }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={authStyles.container}>
      <View style={authStyles.headerContainer}>
        <Text style={authStyles.title}>Welcome Back</Text>
        <Text style={authStyles.subtitle}>Login to your account</Text>
      </View>
      <View style={authStyles.formContainer}>
        <Text style={authStyles.label}>School ID</Text>
        <TextInput
          value={credential}
          onChangeText={setCredential}
          autoCapitalize="none"
          placeholder="2023-70400"
          placeholderTextColor="#64748b"
          style={authStyles.input}
        />
        <Text style={authStyles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor="#64748b"
          style={authStyles.input}
        />
        <AuthButton
          title="Login"
          onPress={() =>
            signInWithEmailAndPassword(auth, getAuthEmail(credential), password)
              .then((uc) => onSwitch('dashboard', createAppUser(uc.user)))
              .catch((e) => alert(e.message))
          }
        />
        <View style={authStyles.switchContainer}>
          <Text style={authStyles.switchText}>Don't have an account? </Text>
          <Pressable onPress={() => onSwitch('register')}>
            <Text style={authStyles.switchLink}>Register</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

function RegisterScreen({ onSwitch }) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const handleRegister = () => {
    if (!name || !schoolId || !password) { alert('Please fill in all fields.'); return; }
    const isProfessor = schoolId.toUpperCase().startsWith('PROF-');
    const role = isProfessor ? 'professor' : 'student';
    createUserWithEmailAndPassword(auth, getAuthEmail(schoolId), password)
      .then((result) => updateProfile(result.user, { displayName: `${role}:${name}:${schoolId}` }))
      .then(() => onSwitch('login'))
      .catch((e) => alert(e.message));
  };

  return (
    <SafeAreaView style={authStyles.container}>
      <View style={authStyles.headerContainer}>
        <Text style={authStyles.title}>Create Account</Text>
        <Text style={authStyles.subtitle}>Register as a student or professor</Text>
      </View>
      <View style={authStyles.formContainer}>
        <Text style={authStyles.label}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Juan Dela Cruz" placeholderTextColor="#64748b" style={authStyles.input} />
        <Text style={authStyles.label}>School ID</Text>
        <TextInput value={schoolId} onChangeText={setSchoolId} autoCapitalize="none" placeholder="2023-70400 or PROF-123" placeholderTextColor="#64748b" style={authStyles.input} />
        <Text style={authStyles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor="#64748b" style={authStyles.input} />
        <AuthButton title="Register" onPress={handleRegister} />
        <View style={authStyles.switchContainer}>
          <Text style={authStyles.switchText}>Already have an account? </Text>
          <Pressable onPress={() => onSwitch('login')}>
            <Text style={authStyles.switchLink}>Login</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

function StudentDashboard({ user, record, onLogout }) {
  const studentRecord = record || { schoolId: user.idNumber, name: user.name, course: '', block: '', yearLevel: '', grades: [] };
  const gwa = studentRecord.grades.length
    ? (studentRecord.grades.reduce((sum, g) => sum + Number(g.grade || 0), 0) / studentRecord.grades.length).toFixed(2)
    : '-';

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView>
        <Text style={dashboardStyles.title}>Student Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Student</Text>
        <View style={dashboardStyles.spacer} />
        <Text style={dashboardStyles.sectionTitle}>Student Info</Text>
        <View style={dashboardStyles.tableRow}><Text style={dashboardStyles.tableCell}>Name</Text><Text style={dashboardStyles.tableCell}>{user.name}</Text></View>
        <View style={dashboardStyles.tableRow}><Text style={dashboardStyles.tableCell}>School ID</Text><Text style={dashboardStyles.tableCell}>{user.idNumber || ''}</Text></View>
        <View style={dashboardStyles.tableRow}><Text style={dashboardStyles.tableCell}>Course</Text><Text style={dashboardStyles.tableCell}>{studentRecord.course}</Text></View>
        <View style={dashboardStyles.tableRow}><Text style={dashboardStyles.tableCell}>Block</Text><Text style={dashboardStyles.tableCell}>{studentRecord.block}</Text></View>
        <View style={dashboardStyles.tableRow}><Text style={dashboardStyles.tableCell}>Year</Text><Text style={dashboardStyles.tableCell}>{studentRecord.yearLevel}</Text></View>
        <View style={dashboardStyles.spacer} />
        <Text style={dashboardStyles.sectionTitle}>Grades</Text>
        <View style={[dashboardStyles.tableRow, dashboardStyles.headerRow]}>
          <Text style={dashboardStyles.tableCell}>Code</Text>
          <Text style={dashboardStyles.tableCell}>Subject</Text>
          <Text style={dashboardStyles.tableCell}>Units</Text>
          <Text style={dashboardStyles.tableCell}>Grade</Text>
          <Text style={dashboardStyles.tableCell}>Professor</Text>
        </View>
        {studentRecord.grades.map((g, i) => (
          <View key={i} style={dashboardStyles.tableRow}>
            <Text style={dashboardStyles.tableCell}>{g.code}</Text>
            <Text style={dashboardStyles.tableCell}>{g.subject}</Text>
            <Text style={dashboardStyles.tableCell}>{g.units}</Text>
            <Text style={dashboardStyles.tableCell}>{g.grade}</Text>
            <Text style={dashboardStyles.tableCell}>{g.professorName || 'N/A'}</Text>
          </View>
        ))}
        <View style={dashboardStyles.spacer} />
        <Text>GWA: {gwa}</Text>
        <View style={dashboardStyles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={dashboardStyles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BlockStudentsScreen({ block, onBack, onLogout }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', schoolId: '' });

  useEffect(() => {
    getDocs(collection(db, 'blocks', block.firestoreId, 'students'))
      .then((snap) => setStudents(snap.docs.map((d) => ({
        firestoreId: d.id, ...d.data(),
        grades: d.data().grades || [{ code: block.subjectCode, subject: block.subjectName, units: block.units, grade: '' }],
      }))))
      .catch((e) => alert(e.message));
  }, [block.firestoreId]);

  const addStudent = () => {
    if (!newStudent.name || !newStudent.schoolId) { alert('Name and School ID are required.'); return; }
    const data = {
      name: newStudent.name,
      schoolId: newStudent.schoolId,
      course: block.course,
      block: block.blockName,
      yearLevel: block.yearLevel,
      grades: [{ code: block.subjectCode, subject: block.subjectName, units: block.units, grade: '' }],
    };
    addDoc(collection(db, 'blocks', block.firestoreId, 'students'), data)
      .then((ref) => { setStudents((p) => [...p, { ...data, firestoreId: ref.id }]); setNewStudent({ name: '', schoolId: '' }); setIsAdding(false); alert('Student added.'); })
      .catch((e) => alert(e.message));
  };

  const deleteStudent = (s) => {
    deleteDoc(doc(db, 'blocks', block.firestoreId, 'students', s.firestoreId))
      .then(() => { setStudents((p) => p.filter((x) => x.firestoreId !== s.firestoreId)); alert('Student deleted.'); })
      .catch((e) => alert(e.message));
  };

  const saveChanges = () => {
    updateDoc(doc(db, 'blocks', block.firestoreId, 'students', selected.firestoreId), { name: selected.name, grades: selected.grades })
      .then(() => { setStudents((p) => p.map((s) => (s.firestoreId === selected.firestoreId ? selected : s))); setSelected(null); alert('Saved.'); })
      .catch((e) => alert(e.message));
  };

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView>
        <Text style={dashboardStyles.title}>{block.blockName}</Text>
        <Text>Course: {block.course}</Text>
        <Text>Year Level: {block.yearLevel}</Text>
        <Text>Subject: {block.subjectCode} - {block.subjectName} ({block.units} units)</Text>
        <View style={dashboardStyles.spacer} />
        <Button title="Back to Blocks" onPress={onBack} />
        <View style={dashboardStyles.spacer} />
        <Text style={dashboardStyles.sectionTitle}>Students</Text>
        <Button title="Add Student" onPress={() => { setIsAdding(true); setSelected(null); }} />
        <View style={dashboardStyles.spacer} />
        {isAdding && (
          <>
            <Text>Full Name</Text>
            <TextInput value={newStudent.name} onChangeText={(v) => setNewStudent((p) => ({ ...p, name: v }))} placeholder="Full name" style={dashboardStyles.input} />
            <Text>School ID</Text>
            <TextInput value={newStudent.schoolId} onChangeText={(v) => setNewStudent((p) => ({ ...p, schoolId: v }))} placeholder="2023-70400" style={dashboardStyles.input} />
            <Button title="Save New Student" onPress={addStudent} />
            <View style={dashboardStyles.spacer} />
            <Button title="Cancel" onPress={() => setIsAdding(false)} />
            <View style={dashboardStyles.spacer} />
          </>
        )}
        {students.map((s) => (
          <View key={s.firestoreId} style={dashboardStyles.recordCard}>
            <Text style={dashboardStyles.boldText}>{s.name}</Text>
            <Text>School ID: {s.schoolId}</Text>
            <Text>Grade: {s.grades[0]?.grade || 'Not yet graded'}</Text>
            <View style={dashboardStyles.editButton}>
              <Button title="Edit Grade" onPress={() => { setSelected({ ...s, grades: s.grades.map((g) => ({ ...g })) }); setIsAdding(false); }} />
            </View>
            <View style={dashboardStyles.editButton}>
              <Button title="Delete" onPress={() => deleteStudent(s)} />
            </View>
          </View>
        ))}
        {selected && (
          <>
            <View style={dashboardStyles.spacer} />
            <Text style={dashboardStyles.sectionTitle}>Edit: {selected.name}</Text>
            <Text>Name</Text>
            <TextInput value={selected.name} onChangeText={(v) => setSelected((p) => ({ ...p, name: v }))} style={dashboardStyles.input} />
            <Text style={dashboardStyles.subTitle}>{selected.grades[0]?.subject}</Text>
            <Text>Grade</Text>
            <TextInput
              value={selected.grades[0]?.grade}
              onChangeText={(v) => setSelected((p) => ({ ...p, grades: [{ ...p.grades[0], grade: v }] }))}
              placeholder="e.g. 1.75"
              style={dashboardStyles.input}
            />
            <Button title="Save Changes" onPress={saveChanges} />
            <View style={dashboardStyles.spacer} />
            <Button title="Cancel" onPress={() => setSelected(null)} />
          </>
        )}
        <View style={dashboardStyles.spacer} />
        <Button title="Logout" onPress={onLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfessorDashboard({ user, onLogout }) {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({
    blockName: '',
    course: '',
    yearLevel: '',
    subjectCode: '',
    subjectName: '',
    units: ''
  });

  useEffect(() => {
    getDocs(collection(db, 'blocks'))
      .then((snap) =>
        setBlocks(
          snap.docs
            .map((d) => ({ firestoreId: d.id, ...d.data() }))
            .filter((b) => b.uid === user.uid)
        )
      )
      .catch((e) => alert(e.message));
  }, []);

  const saveBlock = () => {
    const { blockName, course, yearLevel, subjectCode, subjectName, units } = newBlock;
    if (!blockName || !course || !yearLevel || !subjectCode || !subjectName || !units) {
      alert('All fields are required.');
      return;
    }
    addDoc(collection(db, 'blocks'), {
      ...newBlock,
      uid: user.uid,
      professorName: user.name
    })
      .then((ref) => {
        setBlocks((p) => [
          ...p,
          { firestoreId: ref.id, ...newBlock, uid: user.uid, professorName: user.name }
        ]);
        setNewBlock({
          blockName: '',
          course: '',
          yearLevel: '',
          subjectCode: '',
          subjectName: '',
          units: ''
        });
        setIsAddingBlock(false);
        alert('Block created.');
      })
      .catch((e) => alert(e.message));
  };

  const deleteBlock = (block) => {
    deleteDoc(doc(db, 'blocks', block.firestoreId))
      .then(() => {
        setBlocks((p) => p.filter((b) => b.firestoreId !== block.firestoreId));
        alert('Block deleted.');
      })
      .catch((e) => alert(e.message));
  };

  if (selectedBlock) {
    return (
      <BlockStudentsScreen
        block={selectedBlock}
        onBack={() => setSelectedBlock(null)}
        onLogout={onLogout}
      />
    );
  }

  return (
    <SafeAreaView style={dashboardStyles.container}>
      <ScrollView>
        <Text style={dashboardStyles.title}>Professor Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Professor</Text>
        <View style={dashboardStyles.spacer} />
        <Text style={dashboardStyles.sectionTitle}>Blocks</Text>
        <Button title="Create Block" onPress={() => setIsAddingBlock(true)} />
        <View style={dashboardStyles.spacer} />
        {isAddingBlock && (
          <>
            <Text style={dashboardStyles.sectionTitle}>New Block</Text>
            <Text>Block Name</Text>
            <TextInput
              value={newBlock.blockName}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, blockName: v }))}
              placeholder="e.g. Block A"
              style={dashboardStyles.input}
            />
            <Text>Course</Text>
            <TextInput
              value={newBlock.course}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, course: v }))}
              placeholder="e.g. BSIT"
              style={dashboardStyles.input}
            />
            <Text>Year Level</Text>
            <TextInput
              value={newBlock.yearLevel}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, yearLevel: v }))}
              placeholder="e.g. 2"
              style={dashboardStyles.input}
            />
            <Text>Subject Code</Text>
            <TextInput
              value={newBlock.subjectCode}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, subjectCode: v }))}
              placeholder="e.g. CC101"
              style={dashboardStyles.input}
            />
            <Text>Subject Name</Text>
            <TextInput
              value={newBlock.subjectName}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, subjectName: v }))}
              placeholder="e.g. Computer Programming"
              style={dashboardStyles.input}
            />
            <Text>Units</Text>
            <TextInput
              value={newBlock.units}
              onChangeText={(v) => setNewBlock((p) => ({ ...p, units: v }))}
              placeholder="e.g. 3"
              style={dashboardStyles.input}
            />
            <Button title="Save Block" onPress={saveBlock} />
            <View style={dashboardStyles.spacer} />
            <Button title="Cancel" onPress={() => setIsAddingBlock(false)} />
            <View style={dashboardStyles.spacer} />
          </>
        )}
        {blocks.map((block) => (
          <View key={block.firestoreId} style={dashboardStyles.recordCard}>
            <Text style={dashboardStyles.boldText}>{block.blockName}</Text>
            <Text>Course: {block.course}</Text>
            <Text>Year Level: {block.yearLevel}</Text>
            <Text>Subject Code: {block.subjectCode}</Text>
            <Text>Subject: {block.subjectName}</Text>
            <View style={dashboardStyles.editButton}>
              <Button title="Open" onPress={() => setSelectedBlock(block)} />
            </View>
            <View style={dashboardStyles.editButton}>
              <Button title="Delete Block" onPress={() => deleteBlock(block)} />
            </View>
          </View>
        ))}
        <View style={dashboardStyles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={dashboardStyles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DashboardScreen({ user, onLogout }) {
  const [studentRecord, setStudentRecord] = useState(null);

  useEffect(() => {
    if (user.role !== 'student') return;
    getDocs(collection(db, 'blocks'))
      .then((blockSnap) => {
        const blockDocs = blockSnap.docs;
        return Promise.all(
          blockDocs.map((b) =>
            getDocs(collection(db, 'blocks', b.id, 'students')).then((studentSnap) =>
              studentSnap.docs.map((s) => ({
                firestoreId: s.id,
                ...s.data(),
                grades: (s.data().grades || []).map(g => ({ ...g, professorName: b.data().professorName }))
              }))
            )
          )
        );
      })
      .then((allStudentArrays) => {
        const all = allStudentArrays.flat();
        const matchingRecords = all.filter((s) => s.schoolId === user.idNumber);
        if (matchingRecords.length > 0) {
          const mergedRecord = {
            ...matchingRecords[0],
            grades: matchingRecords.flatMap(r => r.grades || [])
          };
          setStudentRecord(mergedRecord);
        }
      })
      .catch((e) => alert('Failed to load student record: ' + e.message));
  }, [user]);

  if (user.role === 'professor') {
    return <ProfessorDashboard user={user} onLogout={onLogout} />;
  }
  return <StudentDashboard user={user} record={studentRecord} onLogout={onLogout} />;
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

  if (screen === 'register') return <RegisterScreen onSwitch={handleSwitch} />;
  if (screen === 'dashboard')
    return <DashboardScreen user={user} onLogout={handleLogout} />;
  return <LoginScreen onSwitch={handleSwitch} />;
}

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f1f5f9',
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#3b82f6',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  switchLink: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 14,
  },
});

const dashboardStyles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, marginBottom: 16 },
  subTitle: { marginTop: 12, marginBottom: 8, fontSize: 18 },
  label: { fontSize: 14, color: '#333', marginBottom: 4 },
  body: { fontSize: 16, color: '#222' },
  input: { borderWidth: 1, padding: 8, marginBottom: 12, borderRadius: 4 },
  spacer: { height: 16 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 6 },
  headerRow: { backgroundColor: '#f2f2f2' },
  tableCell: { flex: 1 },
  recordCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  boldText: { fontWeight: '700', marginBottom: 4 },
  editButton: { marginTop: 8, alignSelf: 'flex-start' },
  gradeRow: { marginBottom: 12 },
  gradeInput: { marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
});