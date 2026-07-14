const FirestoreDB = (() => {
  const db = firebase.firestore();

  async function createUser(uid, data) {
    await db.collection('users').doc(uid).set({
      email: data.email || '',
      role: data.role || 'student',
      accessType: data.accessType || 'full',
      lessons: data.lessons || [],
      expiresAt: data.expiresAt || null,
      status: 'active',
      label: data.label || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      progress: {}
    });
  }

  async function updateUser(uid, data) {
    const updateData = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.accessType !== undefined) updateData.accessType = data.accessType;
    if (data.lessons !== undefined) updateData.lessons = data.lessons;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.label !== undefined) updateData.label = data.label;
    await db.collection('users').doc(uid).update(updateData);
  }

  async function deleteUser(uid) {
    await db.collection('users').doc(uid).delete();
  }

  async function getUser(uid) {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() };
  }

  async function getAllUsers() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  }

  async function canAccessLesson(uid, lessonId) {
    const user = await getUser(uid);
    if (!user) return false;
    if (user.status === 'deactivated') return false;
    if (user.role === 'admin') return true;
    if (user.accessType === 'full') {
      if (user.expiresAt && user.expiresAt.toDate() < new Date()) return false;
      return true;
    }
    if (user.accessType === 'lesson') {
      if (user.expiresAt && user.expiresAt.toDate() < new Date()) return false;
      return user.lessons && user.lessons.includes(lessonId);
    }
    return false;
  }

  async function saveProgress(uid, lessonKey, stepIndex, completed) {
    const userRef = db.collection('users').doc(uid);
    const user = await userRef.get();
    if (!user.exists) return;

    const progress = user.data().progress || {};
    const lessonProgress = progress[lessonKey] || { completed: [], lastStep: 0, score: 0 };

    lessonProgress.completed[stepIndex] = completed;
    lessonProgress.lastStep = stepIndex + 1;

    const totalSteps = lessonProgress.completed.length;
    const doneCount = lessonProgress.completed.filter(Boolean).length;
    lessonProgress.score = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0;

    progress[lessonKey] = lessonProgress;
    await userRef.update({ progress });
    return lessonProgress;
  }

  async function getProgress(uid, lessonKey) {
    const user = await getUser(uid);
    if (!user || !user.progress) return null;
    return user.progress[lessonKey] || null;
  }

  async function getAllProgress() {
    const users = await getAllUsers();
    return users.map(u => ({
      uid: u.uid,
      email: u.email,
      label: u.label,
      progress: u.progress || {}
    }));
  }

  return {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getAllUsers,
    canAccessLesson,
    saveProgress,
    getProgress,
    getAllProgress,
    db
  };
})();
