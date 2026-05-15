import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
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

const initialStudentRecords = [];

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

function LoginScreen({ onSwitch }) {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text>School ID</Text>
      <TextInput value={credential} onChangeText={setCredential} autoCapitalize="none" placeholder="2023-70400" style={styles.input} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
      <Text>School ID</Text>
      <TextInput value={schoolId} onChangeText={setSchoolId} autoCapitalize="none" placeholder="2023-70400" style={styles.input} />
      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" style={styles.input} />
      <View style={styles.spacer} />
      <Button title="Register" onPress={handleRegister} />
      <View style={styles.spacer} />
      <Button title="Go to Login" onPress={() => onSwitch('login')} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function StudentDashboard({ user, record, onLogout }) {
  const studentRecord = record || { schoolId: user.idNumber, name: user.name, course: '', block: '', yearLevel: '', grades: [] };
  const gwa = studentRecord.grades.length
    ? (studentRecord.grades.reduce((sum, g) => sum + Number(g.grade || 0), 0) / studentRecord.grades.length).toFixed(2)
    : '-';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Student Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Student</Text>
        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Student Info</Text>
        <View style={styles.tableRow}><Text style={styles.tableCell}>Name</Text><Text style={styles.tableCell}>{user.name}</Text></View>
        <View style={styles.tableRow}><Text style={styles.tableCell}>School ID</Text><Text style={styles.tableCell}>{user.idNumber || ''}</Text></View>
        <View style={styles.tableRow}><Text style={styles.tableCell}>Course</Text><Text style={styles.tableCell}>{studentRecord.course}</Text></View>
        <View style={styles.tableRow}><Text style={styles.tableCell}>Block</Text><Text style={styles.tableCell}>{studentRecord.block}</Text></View>
        <View style={styles.tableRow}><Text style={styles.tableCell}>Year</Text><Text style={styles.tableCell}>{studentRecord.yearLevel}</Text></View>
        <View style={styles.spacer} />
        <Text style={styles.sectionTitle}>Grades</Text>
        <View style={[styles.tableRow, styles.headerRow]}>
          <Text style={styles.tableCell}>Code</Text>
          <Text style={styles.tableCell}>Subject</Text>
          <Text style={styles.tableCell}>Units</Text>
          <Text style={styles.tableCell}>Grade</Text>
          <Text style={styles.tableCell}>Professor</Text>
        </View>
        {studentRecord.grades.map((g, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}>{g.code}</Text>
            <Text style={styles.tableCell}>{g.subject}</Text>
            <Text style={styles.tableCell}>{g.units}</Text>
            <Text style={styles.tableCell}>{g.grade}</Text>
            <Text style={styles.tableCell}>{g.professorName || 'N/A'}</Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>{block.blockName}</Text>
        <Text>Course: {block.course}</Text>
        <Text>Year Level: {block.yearLevel}</Text>
        <Text>Subject: {block.subjectCode} - {block.subjectName} ({block.units} units)</Text>
        <View style={styles.spacer} />
        <Button title="Back to Blocks" onPress={onBack} />
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Students</Text>
        <Button title="Add Student" onPress={() => { setIsAdding(true); setSelected(null); }} />
        <View style={styles.spacer} />

        {isAdding && (
          <>
            <Text>Full Name</Text>
            <TextInput value={newStudent.name} onChangeText={(v) => setNewStudent((p) => ({ ...p, name: v }))} placeholder="Full name" style={styles.input} />
            <Text>School ID</Text>
            <TextInput value={newStudent.schoolId} onChangeText={(v) => setNewStudent((p) => ({ ...p, schoolId: v }))} placeholder="2023-70400" style={styles.input} />
            <Button title="Save New Student" onPress={addStudent} />
            <View style={styles.spacer} />
            <Button title="Cancel" onPress={() => setIsAdding(false)} />
            <View style={styles.spacer} />
          </>
        )}

        {students.map((s) => (
          <View key={s.firestoreId} style={styles.recordCard}>
            <Text style={styles.boldText}>{s.name}</Text>
            <Text>School ID: {s.schoolId}</Text>
            <Text>Grade: {s.grades[0]?.grade || 'Not yet graded'}</Text>
            <View style={styles.editButton}>
              <Button title="Edit Grade" onPress={() => { setSelected({ ...s, grades: s.grades.map((g) => ({ ...g })) }); setIsAdding(false); }} />
            </View>
            <View style={styles.editButton}>
              <Button title="Delete" onPress={() => deleteStudent(s)} />
            </View>
          </View>
        ))}

        {selected && (
          <>
            <View style={styles.spacer} />
            <Text style={styles.sectionTitle}>Edit: {selected.name}</Text>
            <Text>Name</Text>
            <TextInput value={selected.name} onChangeText={(v) => setSelected((p) => ({ ...p, name: v }))} style={styles.input} />
            <Text style={styles.subTitle}>{selected.grades[0]?.subject}</Text>
            <Text>Grade</Text>
            <TextInput
              value={selected.grades[0]?.grade}
              onChangeText={(v) => setSelected((p) => ({ ...p, grades: [{ ...p.grades[0], grade: v }] }))}
              placeholder="e.g. 1.75"
              style={styles.input}
            />
            <View style={styles.spacer} />
            <Button title="Save Changes" onPress={saveChanges} />
            <View style={styles.spacer} />
            <Button title="Cancel" onPress={() => setSelected(null)} />
          </>
        )}

        <View style={styles.spacer} />
        <Button title="Logout" onPress={onLogout} />
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfessorDashboard({ user, records, setRecords, onLogout }) {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ blockName: '', course: '', yearLevel: '', subjectCode: '', subjectName: '', units: '' });

  useEffect(() => {
    getDocs(collection(db, 'blocks'))
      .then((snap) => setBlocks(snap.docs.map((d) => ({ firestoreId: d.id, ...d.data() })).filter((b) => b.uid === user.uid)))
      .catch((e) => alert(e.message));
  }, []);

  const saveBlock = () => {
    const { blockName, course, yearLevel, subjectCode, subjectName, units } = newBlock;
    if (!blockName || !course || !yearLevel || !subjectCode || !subjectName || !units) { alert('All fields are required.'); return; }
    addDoc(collection(db, 'blocks'), { ...newBlock, uid: user.uid, professorName: user.name })
      .then((ref) => { setBlocks((p) => [...p, { firestoreId: ref.id, ...newBlock, uid: user.uid, professorName: user.name }]); setNewBlock({ blockName: '', course: '', yearLevel: '', subjectCode: '', subjectName: '', units: '' }); setIsAddingBlock(false); alert('Block created.'); })
      .catch((e) => alert(e.message));
  };

  const deleteBlock = (block) => {
    deleteDoc(doc(db, 'blocks', block.firestoreId))
      .then(() => { setBlocks((p) => p.filter((b) => b.firestoreId !== block.firestoreId)); alert('Block deleted.'); })
      .catch((e) => alert(e.message));
  };

  const startEditing = (record) => { setSelectedRecord({ ...record, grades: record.grades.map((g) => ({ ...g })) }); };
  const saveChanges = () => { if (!selectedRecord) return; setRecords((p) => p.map((r) => (r.id === selectedRecord.id ? selectedRecord : r))); setSelectedRecord(null); };
  const updateField = (field, value) => { setSelectedRecord((p) => ({ ...p, [field]: value })); };
  const updateGrade = (index, field, value) => {
    setSelectedRecord((p) => {
      const grades = [...p.grades];
      grades[index] = { ...grades[index], [field]: value };
      return { ...p, grades };
    });
  };

  if (selectedBlock) {
    return <BlockStudentsScreen block={selectedBlock} onBack={() => setSelectedBlock(null)} onLogout={onLogout} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Professor Dashboard</Text>
        <Text>Welcome, {user.name}</Text>
        <Text>Role: Professor</Text>
        <View style={styles.spacer} />

        <Text style={styles.sectionTitle}>Blocks</Text>
        <Button title="Create Block" onPress={() => setIsAddingBlock(true)} />
        <View style={styles.spacer} />

        {isAddingBlock && (
          <>
            <Text style={styles.sectionTitle}>New Block</Text>
            <Text>Block Name</Text>
            <TextInput value={newBlock.blockName} onChangeText={(v) => setNewBlock((p) => ({ ...p, blockName: v }))} placeholder="e.g. Block A" style={styles.input} />
            <Text>Course</Text>
            <TextInput value={newBlock.course} onChangeText={(v) => setNewBlock((p) => ({ ...p, course: v }))} placeholder="e.g. BSIT" style={styles.input} />
            <Text>Year Level</Text>
            <TextInput value={newBlock.yearLevel} onChangeText={(v) => setNewBlock((p) => ({ ...p, yearLevel: v }))} placeholder="e.g. 2" style={styles.input} />
            <Text>Subject Code</Text>
            <TextInput value={newBlock.subjectCode} onChangeText={(v) => setNewBlock((p) => ({ ...p, subjectCode: v }))} placeholder="e.g. CC101" style={styles.input} />
            <Text>Subject Name</Text>
            <TextInput value={newBlock.subjectName} onChangeText={(v) => setNewBlock((p) => ({ ...p, subjectName: v }))} placeholder="e.g. Computer Programming" style={styles.input} />
            <Text>Units</Text>
            <TextInput value={newBlock.units} onChangeText={(v) => setNewBlock((p) => ({ ...p, units: v }))} placeholder="e.g. 3" style={styles.input} />
            <Button title="Save Block" onPress={saveBlock} />
            <View style={styles.spacer} />
            <Button title="Cancel" onPress={() => setIsAddingBlock(false)} />
            <View style={styles.spacer} />
          </>
        )}

        {blocks.map((block) => (
          <View key={block.firestoreId} style={styles.recordCard}>
            <Text style={styles.boldText}>{block.blockName}</Text>
            <Text>Course: {block.course}</Text>
            <Text>Year Level: {block.yearLevel}</Text>
            <Text>Subject Code: {block.subjectCode}</Text>
            <Text>Subject: {block.subjectName}</Text>
            <View style={styles.editButton}>
              <Button title="Open" onPress={() => setSelectedBlock(block)} />
            </View>
            <View style={styles.editButton}>
              <Button title="Delete Block" onPress={() => deleteBlock(block)} />
            </View>
          </View>
        ))}

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
            <TextInput value={selectedRecord.name} onChangeText={(v) => updateField('name', v)} style={styles.input} />
            <Text>Course</Text>
            <TextInput value={selectedRecord.course} onChangeText={(v) => updateField('course', v)} style={styles.input} />
            <Text>Block</Text>
            <TextInput value={selectedRecord.block} onChangeText={(v) => updateField('block', v)} style={styles.input} />
            <Text>Year Level</Text>
            <TextInput value={selectedRecord.yearLevel} onChangeText={(v) => updateField('yearLevel', v)} style={styles.input} />
            <Text style={styles.subTitle}>Grades</Text>
            {selectedRecord.grades.map((g, i) => (
              <View key={i} style={styles.gradeRow}>
                <TextInput value={g.code} onChangeText={(v) => updateGrade(i, 'code', v)} placeholder="Code" style={[styles.input, styles.gradeInput]} />
                <TextInput value={g.subject} onChangeText={(v) => updateGrade(i, 'subject', v)} placeholder="Subject" style={[styles.input, styles.gradeInput]} />
                <TextInput value={g.units} onChangeText={(v) => updateGrade(i, 'units', v)} placeholder="Units" style={[styles.input, styles.gradeInput]} />
                <TextInput value={g.grade} onChangeText={(v) => updateGrade(i, 'grade', v)} placeholder="Grade" style={[styles.input, styles.gradeInput]} />
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
        // Find ALL records for this student and merge their grades
        const matchingRecords = all.filter((s) => s.schoolId === user.idNumber);
        if (matchingRecords.length > 0) {
          // Use the first record as base, but merge all grades from all records
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
    return <ProfessorDashboard user={user} records={records} setRecords={setRecords} onLogout={onLogout} />;
  }
  return <StudentDashboard user={user} record={studentRecord} onLogout={onLogout} />;
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});