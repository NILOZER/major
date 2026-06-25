// ===== EVENTS & STATUS HISTORY MODULE =====

// Log an event to Firestore
function logEvent(type, payload) {
  if (!currentUser) return;

  const event = {
    userId: currentUser.uid,
    userName: '',
    type: type,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    payload: payload || {}
  };

  // Try to get user name
  db.collection('users').doc(currentUser.uid).get().then(doc => {
    if (doc.exists) {
      event.userName = doc.data().name || '';
    }
    // Write event
    db.collection('events').add(event).catch(err => {
      console.warn('Failed to log event:', err);
    });
  }).catch(() => {
    db.collection('events').add(event).catch(err => {
      console.warn('Failed to log event:', err);
    });
  });
}

// Log a status change to the statusHistory collection
function logStatusChange(userId, previousStatus, newStatus, changedBy, reason) {
  const record = {
    userId: userId,
    previousStatus: previousStatus,
    newStatus: newStatus,
    changedBy: changedBy || currentUser?.uid || 'unknown',
    changedByName: currentUser?.displayName || '',
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    reason: reason || ''
  };

  // Try to get changer name
  if (currentUser) {
    db.collection('users').doc(currentUser.uid).get().then(doc => {
      if (doc.exists) {
        record.changedByName = doc.data().name || '';
      }
      db.collection('statusHistory').add(record).catch(err => {
        console.warn('Failed to log status change:', err);
      });
    }).catch(() => {
      db.collection('statusHistory').add(record).catch(err => {
        console.warn('Failed to log status change:', err);
      });
    });
  } else {
    db.collection('statusHistory').add(record).catch(err => {
      console.warn('Failed to log status change:', err);
    });
  }

  // Also log as event for backward compat
  logEvent('status_change', { previousStatus, newStatus, reason });
}

// Get events for a specific user
function getUserEvents(userId, limit = 20) {
  return db.collection('events')
    .where('userId', '==', userId)
    .get()
    .then(snapshot => {
      const events = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });
      // Sort by timestamp descending in memory to avoid Firestore composite index requirement
      events.sort((a, b) => {
        const tA = a.timestamp?.toMillis?.() || 0;
        const tB = b.timestamp?.toMillis?.() || 0;
        return tB - tA;
      });
      return events.slice(0, limit);
    });
}

// Get status history for a specific user
function getStatusHistory(userId, limit = 50) {
  return db.collection('statusHistory')
    .where('userId', '==', userId)
    .get()
    .then(snapshot => {
      const history = [];
      snapshot.forEach(doc => {
        history.push({ id: doc.id, ...doc.data() });
      });
      // Sort by timestamp descending in memory to avoid Firestore composite index requirement
      history.sort((a, b) => {
        const tA = a.timestamp?.toMillis?.() || 0;
        const tB = b.timestamp?.toMillis?.() || 0;
        return tB - tA;
      });
      return history.slice(0, limit);
    });
}

// Listen to all events (for instructor)
function listenToAllEvents(callback) {
  return db.collection('events')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot(snapshot => {
      const events = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });
      callback(events);
    }, err => {
      console.warn('Events listener error:', err);
    });
}

// Listen to all platoons (for instructor registration dropdowns etc.)
function listenToPlatoons(instructorId, callback) {
  return db.collection('platoons')
    .where('instructorId', '==', instructorId)
    .onSnapshot(snapshot => {
      const platoons = [];
      snapshot.forEach(doc => {
        platoons.push({ id: doc.id, ...doc.data() });
      });
      callback(platoons);
    }, err => {
      console.warn('Platoons listener error:', err);
    });
}

// Get all platoons (for cadet registration)
function getAllPlatoons() {
  return db.collection('platoons')
    .get()
    .then(snapshot => {
      const platoons = [];
      snapshot.forEach(doc => {
        platoons.push({ id: doc.id, ...doc.data() });
      });
      return platoons;
    });
}
