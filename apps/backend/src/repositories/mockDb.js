const fs = require('fs');
const path = require('path');
const dbFilePath = path.join(__dirname, 'mock_db_data.json');

// Default initial seed data
let dbState = {
  users: [
    { id: 1, google_id: 'mock_std', username: null, password_hash: null, email: 'student@university.edu', name: 'Alex Student', role: 'student', profile_picture_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6', student_id: 'ST-2026-01', recruiter_id: null, status: 'active', submission_disabled: false, created_at: new Date().toISOString() },
    { id: 2, google_id: 'mock_rec', username: null, password_hash: null, email: 'recruiter@techcorp.com', name: 'Rachel Recruiter', role: 'recruiter', profile_picture_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330', student_id: null, recruiter_id: 'RC-TECH-10', status: 'active', submission_disabled: false, created_at: new Date().toISOString() },
    { id: 3, google_id: 'mock_adm', username: 'admin', password_hash: '$2a$10$ehkALJMmB/oP9Mai3LZqbe73EQD5VAXMnsCWQfv27aW4RRxDyFI4y', email: 'admin@university.edu', name: 'Arthur Admin', role: 'admin', profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', student_id: null, recruiter_id: null, status: 'active', submission_disabled: false, created_at: new Date().toISOString() }
  ],
  projects: [
    { 
      id: 101, 
      student_id: 1, 
      title: 'Distributed Capstone Microservices', 
      description: 'A cloud-native capsone project deploying Kubernetes, Docker, and MySQL pools. Exposes REST APIs, JWT route guards, and scales horizontally with minimal resource footprints.', 
      technology_stack: ['Docker', 'Kubernetes', 'MySQL', 'Node.js'], 
      thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      github_url: 'https://github.com/alex-dev/microservices',
      deleted_at: null,
      status: 'approved',
      rejection_reason: null,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: 102, 
      student_id: 1, 
      title: 'E-commerce React Dashboard', 
      description: 'Stunning administration panel with glassmorphism layout, dynamic sales analytics (using charts), client-side schema validations, and role-aware navigation.', 
      technology_stack: ['React', 'Vite', 'Tailwind', 'Context API'], 
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      github_url: 'https://github.com/alex-dev/dashboard',
      deleted_at: null,
      status: 'approved',
      rejection_reason: null,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  likes: [],
  followers: [],
  notifications: [],
  audit_logs: []
};

// Load state if file exists to persist across nodemon restarts
if (fs.existsSync(dbFilePath)) {
  try {
    const rawData = fs.readFileSync(dbFilePath, 'utf8');
    dbState = JSON.parse(rawData);
  } catch (e) {
    console.warn('⚠️ Failed to load mock database file, using seeds.', e.message);
  }
} else {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Failed to initialize mock database file:', e.message);
  }
}

function save() {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbState, null, 2), 'utf8');
  } catch (e) {
    console.error('❌ Failed to save mock database state:', e.message);
  }
}

// Deep observer to automatically write to file on object modifications
function makeObservable(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  return new Proxy(obj, {
    set(target, prop, value) {
      const res = Reflect.set(target, prop, value);
      save();
      return res;
    },
    deleteProperty(target, prop) {
      const res = Reflect.deleteProperty(target, prop);
      save();
      return res;
    }
  });
}

// Apply observable observers to default sets
dbState.users = makeObservable(dbState.users.map(makeObservable));
dbState.projects = makeObservable(dbState.projects.map(makeObservable));
dbState.likes = makeObservable(dbState.likes.map(makeObservable));
dbState.followers = makeObservable(dbState.followers.map(makeObservable));
dbState.notifications = makeObservable(dbState.notifications.map(makeObservable));
dbState.audit_logs = makeObservable(dbState.audit_logs.map(makeObservable));

// Wrap arrays to intercept push and splice mutators
const wrapArrayMutator = (arr) => {
  const originalPush = arr.push;
  arr.push = function(...args) {
    const wrappedArgs = args.map(makeObservable);
    const res = originalPush.apply(this, wrappedArgs);
    save();
    return res;
  };
};

wrapArrayMutator(dbState.users);
wrapArrayMutator(dbState.projects);
wrapArrayMutator(dbState.likes);
wrapArrayMutator(dbState.followers);
wrapArrayMutator(dbState.notifications);
wrapArrayMutator(dbState.audit_logs);

module.exports = {
  users: dbState.users,
  projects: dbState.projects,
  likes: dbState.likes,
  followers: dbState.followers,
  notifications: dbState.notifications,
  audit_logs: dbState.audit_logs,
  save
};
