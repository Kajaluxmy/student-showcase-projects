const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('./mockDb');

const projectRepository = {
  async findById(id) {
    if (env.MOCK_DATABASE) {
      const p = mockDb.projects.find((proj) => String(proj.id) === String(id) && proj.deleted_at === null);
      if (!p) return null;
      const student = mockDb.users.find((u) => u.id === p.student_id);
      const likesCount = mockDb.likes.filter((l) => String(l.project_id) === String(id)).length;
      return {
        ...p,
        student_name: student ? student.name : 'Unknown Student',
        student_avatar: student ? student.profile_picture_url : '',
        like_count: likesCount
      };
    }
    const [rows] = await pool.query(
      `SELECT p.*, u.name as student_name, u.profile_picture_url as student_avatar,
       (SELECT COUNT(*) FROM likes WHERE project_id = p.id) as like_count
       FROM projects p
       JOIN users u ON p.student_id = u.id
       WHERE p.id = ? AND p.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findByIdIncludeSoftDeleted(id) {
    if (env.MOCK_DATABASE) {
      return mockDb.projects.find((p) => String(p.id) === String(id)) || null;
    }
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async create(project) {
    if (env.MOCK_DATABASE) {
      const newProj = {
        id: mockDb.projects.length + 101,
        student_id: project.studentId,
        title: project.title,
        description: project.description,
        technology_stack: project.technologyStack,
        thumbnail_url: project.thumbnailUrl,
        github_url: project.githubUrl,
        deleted_at: null,
        status: 'pending',
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockDb.projects.push(newProj);
      return newProj;
    }
    const { studentId, title, description, technologyStack, thumbnailUrl, githubUrl } = project;
    const [result] = await pool.query(
      `INSERT INTO projects (student_id, title, description, technology_stack, thumbnail_url, github_url, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [studentId, title, description, JSON.stringify(technologyStack), thumbnailUrl, githubUrl]
    );
    return { id: result.insertId, ...project, status: 'pending', rejection_reason: null };
  },

  async update(id, project) {
    if (env.MOCK_DATABASE) {
      const projIndex = mockDb.projects.findIndex((p) => String(p.id) === String(id));
      if (projIndex !== -1) {
        mockDb.projects[projIndex] = {
          ...mockDb.projects[projIndex],
          title: project.title,
          description: project.description,
          technology_stack: project.technologyStack,
          thumbnail_url: project.thumbnailUrl,
          github_url: project.githubUrl,
          updated_at: new Date()
        };
      }
      return this.findById(id);
    }
    const { title, description, technologyStack, thumbnailUrl, githubUrl } = project;
    await pool.query(
      `UPDATE projects 
       SET title = ?, description = ?, technology_stack = ?, thumbnail_url = ?, github_url = ? 
       WHERE id = ?`,
      [title, description, JSON.stringify(technologyStack), thumbnailUrl, githubUrl, id]
    );
    return this.findById(id);
  },

  async softDelete(id) {
    if (env.MOCK_DATABASE) {
      const p = mockDb.projects.find((proj) => String(proj.id) === String(id));
      if (p) {
        p.deleted_at = new Date();
      }
      return true;
    }
    await pool.query('UPDATE projects SET deleted_at = NOW() WHERE id = ?', [id]);
    return true;
  },

  async hardDelete(id) {
    if (env.MOCK_DATABASE) {
      const idx = mockDb.projects.findIndex((p) => String(p.id) === String(id));
      if (idx !== -1) mockDb.projects.splice(idx, 1);
      return true;
    }
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return true;
  },

  async findAndCountAll(options) {
    if (env.MOCK_DATABASE) {
      const { limit, offset, search, tech, studentId, likedByUserId, sort, includeDeleted, status, adminView } = options;
      
      let filtered = mockDb.projects;

      if (!includeDeleted) {
        filtered = filtered.filter((p) => p.deleted_at === null);
      }

      if (studentId) {
        filtered = filtered.filter((p) => String(p.student_id) === String(studentId));
      }

      if (likedByUserId) {
        const likedProjectIds = mockDb.likes
          .filter((l) => String(l.user_id) === String(likedByUserId))
          .map((l) => l.project_id);
        filtered = filtered.filter((p) => likedProjectIds.includes(p.id));
      }

      if (tech) {
        filtered = filtered.filter((p) => 
          p.technology_stack?.map((t) => t.toLowerCase()).includes(tech.toLowerCase())
        );
      }

      if (search) {
        const queryStr = search.toLowerCase();
        filtered = filtered.filter((p) => 
          p.title.toLowerCase().includes(queryStr) || 
          p.description.toLowerCase().includes(queryStr)
        );
      }

      // Moderation/approval status filter
      if (status) {
        filtered = filtered.filter((p) => p.status === status);
      } else if (!adminView && !studentId) {
        // Public/Recruiter default to only seeing approved showcase items
        filtered = filtered.filter((p) => p.status === 'approved');
      }

      const rowsMapped = filtered.map((p) => {
        const student = mockDb.users.find((u) => u.id === p.student_id);
        const likesCount = mockDb.likes.filter((l) => String(l.project_id) === String(p.id)).length;
        return {
          ...p,
          student_name: student ? student.name : 'Unknown Student',
          student_avatar: student ? student.profile_picture_url : '',
          like_count: likesCount
        };
      });

      if (sort === 'popular') {
        rowsMapped.sort((a, b) => b.like_count - a.like_count || new Date(b.created_at) - new Date(a.created_at));
      } else {
        rowsMapped.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      const rows = rowsMapped.slice(offset, offset + limit);
      const count = filtered.length;

      return { rows, count };
    }

    const { limit, offset, search, tech, studentId, likedByUserId, sort, includeDeleted, status, adminView } = options;

    let queryStr = `
      SELECT p.*, u.name as student_name, u.profile_picture_url as student_avatar,
      (SELECT COUNT(*) FROM likes WHERE project_id = p.id) as like_count
      FROM projects p
      JOIN users u ON p.student_id = u.id
      WHERE 1=1
    `;
    let countQueryStr = 'SELECT COUNT(*) as count FROM projects p WHERE 1=1';
    const params = [];

    if (!includeDeleted) {
      queryStr += ' AND p.deleted_at IS NULL';
      countQueryStr += ' AND p.deleted_at IS NULL';
    }

    if (studentId) {
      queryStr += ' AND p.student_id = ?';
      countQueryStr += ' AND p.student_id = ?';
      params.push(studentId);
    }

    if (likedByUserId) {
      queryStr += ' AND p.id IN (SELECT project_id FROM likes WHERE user_id = ?)';
      countQueryStr += ' AND p.id IN (SELECT project_id FROM likes WHERE user_id = ?)';
      params.push(likedByUserId);
    }

    if (tech) {
      queryStr += ' AND ? MEMBER OF(p.technology_stack)';
      countQueryStr += ' AND ? MEMBER OF(p.technology_stack)';
      params.push(tech);
    }

    if (search) {
      const searchPattern = `%${search}%`;
      queryStr += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      countQueryStr += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(searchPattern, searchPattern);
    }

    // Status filtering in SQL
    if (status) {
      queryStr += ' AND p.status = ?';
      countQueryStr += ' AND p.status = ?';
      params.push(status);
    } else if (!adminView && !studentId) {
      queryStr += " AND p.status = 'approved'";
      countQueryStr += " AND p.status = 'approved'";
    }

    if (sort === 'popular') {
      queryStr += ' ORDER BY like_count DESC, p.created_at DESC';
    } else {
      queryStr += ' ORDER BY p.created_at DESC';
    }

    const countParams = [...params];
    
    queryStr += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(queryStr, params);
    const [[{ count }]] = await pool.query(countQueryStr, countParams);

    return { rows, count };
  }
};

module.exports = projectRepository;
