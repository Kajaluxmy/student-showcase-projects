const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function safeAddColumn(connection, tableName, columnName, columnDefinition) {
  try {
    await connection.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
    console.log(`✅ Column ${columnName} added to table ${tableName}`);
    return true;
  } catch (error) {
    if (error.errno === 1060 || error.code === 'ER_DUP_FIELDNAME') {
      // Column already exists
      return false;
    } else {
      console.warn(`⚠️ Warning adding column ${columnName} to ${tableName}:`, error.message);
      return false;
    }
  }
}

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Initializing database tables...');

    // 1. Create users table with support for Google OAuth (Student/Recruiter) and Username/Password (Admin)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NULL,
        username VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_picture_url VARCHAR(2083) NULL,
        role ENUM('student', 'recruiter', 'admin') NOT NULL DEFAULT 'student',
        student_id VARCHAR(255) NULL,
        recruiter_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Safely add dynamic governance fields to users table
    await safeAddColumn(connection, 'users', 'status', "ENUM('active', 'suspended') NOT NULL DEFAULT 'active'");
    await safeAddColumn(connection, 'users', 'submission_disabled', 'BOOLEAN NOT NULL DEFAULT FALSE');

    // 2. Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        student_id BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        technology_stack JSON NOT NULL,
        thumbnail_url VARCHAR(2083) NOT NULL,
        github_url VARCHAR(2083) NULL,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_projects_student_id (student_id),
        INDEX idx_projects_created_at (deleted_at, created_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Safely add dynamic moderation fields to projects table
    const addedStatus = await safeAddColumn(connection, 'projects', 'status', "ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'");
    await safeAddColumn(connection, 'projects', 'rejection_reason', 'TEXT NULL DEFAULT NULL');

    // If we just added the status column, set existing seed projects to 'approved' so they remain visible
    if (addedStatus) {
      await connection.query("UPDATE projects SET status = 'approved'");
      console.log("✅ Seed database projects initialized to 'approved' status.");
    }

    // 3. Create likes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS likes (
        user_id BIGINT UNSIGNED NOT NULL,
        project_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, project_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_likes_project_id (project_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create followers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS followers (
        follower_id BIGINT UNSIGNED NOT NULL,
        following_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_followers_following_id (following_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        recipient_id BIGINT UNSIGNED NOT NULL,
        sender_id BIGINT UNSIGNED NULL,
        type VARCHAR(50) NOT NULL,
        entity_id BIGINT UNSIGNED NULL,
        message VARCHAR(500) NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_notifications_unread (recipient_id, is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create audit_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        admin_id BIGINT UNSIGNED NOT NULL,
        action VARCHAR(255) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id BIGINT UNSIGNED NOT NULL,
        reason VARCHAR(500) NULL,
        ip_address VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Seed Default Admin User if no admin exists
    const [adminRows] = await connection.query("SELECT * FROM users WHERE role = 'admin'");
    if (adminRows.length === 0) {
      console.log('🌱 Seeding default administrator account...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await connection.query(
        `INSERT INTO users (username, password_hash, email, name, role) 
         VALUES (?, ?, ?, ?, ?)`,
        ['admin', hash, 'admin@university.edu', 'Arthur Admin', 'admin']
      );
      console.log('🌱 Seed completed: Username "admin" / Password "admin123"');
    }

    console.log('✅ Database tables checked/created successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = initializeDatabase;
