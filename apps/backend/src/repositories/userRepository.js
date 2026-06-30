const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const userRepository = {
  async findById(id) {
    if (env.MOCK_DATABASE) {
      return mockDb.users.find((u) => String(u.id) === String(id)) || null;
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async findByGoogleId(googleId) {
    if (env.MOCK_DATABASE) {
      return mockDb.users.find((u) => u.google_id === googleId) || null;
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    if (env.MOCK_DATABASE) {
      return mockDb.users.find((u) => u.email === email) || null;
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    if (env.MOCK_DATABASE) {
      return mockDb.users.find((u) => u.username === username) || null;
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  },

  async create(user) {
    if (env.MOCK_DATABASE) {
      const newUser = {
        id: mockDb.users.length + 1,
        google_id: user.googleId,
        email: user.email,
        name: user.name,
        profile_picture_url: user.profilePictureUrl,
        role: user.role || 'student',
        student_id: user.studentId || null,
        recruiter_id: user.recruiterId || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockDb.users.push(newUser);
      return newUser;
    }
    const { googleId, email, name, profilePictureUrl, role, studentId, recruiterId } = user;
    const [result] = await pool.query(
      'INSERT INTO users (google_id, email, name, profile_picture_url, role, student_id, recruiter_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [googleId, email, name, profilePictureUrl, role || 'student', studentId || null, recruiterId || null]
    );
    return { id: result.insertId, ...user };
  },

  async updateRole(id, role) {
    if (env.MOCK_DATABASE) {
      const user = mockDb.users.find((u) => String(u.id) === String(id));
      if (user) {
        user.role = role;
      }
      return user;
    }
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return this.findById(id);
  },

  async updateStatus(id, status) {
    if (env.MOCK_DATABASE) {
      const user = mockDb.users.find((u) => String(u.id) === String(id));
      if (user) {
        user.status = status;
      }
      return user;
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async updateSubmissionDisabled(id, disabled) {
    if (env.MOCK_DATABASE) {
      const user = mockDb.users.find((u) => String(u.id) === String(id));
      if (user) {
        user.submission_disabled = !!disabled;
      }
      return user;
    }
    await pool.query('UPDATE users SET submission_disabled = ? WHERE id = ?', [!!disabled, id]);
    return this.findById(id);
  },

  async findAllPaginated(limit, offset) {
    if (env.MOCK_DATABASE) {
      const rows = mockDb.users.slice(offset, offset + limit);
      const count = mockDb.users.length;
      return { rows, count };
    }
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM users');
    return { rows, count };
  },

  async updateProfile(id, { name, email, profilePictureUrl }) {
    if (env.MOCK_DATABASE) {
      const user = mockDb.users.find((u) => String(u.id) === String(id));
      if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (profilePictureUrl !== undefined) user.profile_picture_url = profilePictureUrl;
        user.updated_at = new Date();
      }
      return user || null;
    }
    await pool.query(
      'UPDATE users SET name = ?, email = ?, profile_picture_url = ? WHERE id = ?',
      [name, email, profilePictureUrl, id]
    );
    return this.findById(id);
  },

  async findAdmins() {
    if (env.MOCK_DATABASE) {
      return mockDb.users.filter(u => u.role === 'admin');
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE role = 'admin'");
    return rows;
  }
};

module.exports = userRepository;
