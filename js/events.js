// ===== EVENTS MODULE =====

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

// Get events for a specific user
function getUserEvents(userId, limit = 20) {
  return db.collection('events')
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get()
    .then(snapshot => {
      const events = [];
      snapshot.forEach(doc => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
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
