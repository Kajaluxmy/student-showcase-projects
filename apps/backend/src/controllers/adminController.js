const { pool } = require('../config/db');
const env = require('../config/env');
const mockDb = require('../repositories/mockDb');
const auditLogRepository = require('../repositories/auditLogRepository');
const userRepository = require('../repositories/userRepository');
const projectRepository = require('../repositories/projectRepository');
const notificationRepository = require('../repositories/notificationRepository');

const adminController = {
  async getStats(req, res, next) {
    try {
      let stats = {};

      if (env.MOCK_DATABASE) {
        const totalUsers = mockDb.users.length;
        const totalRecruiters = mockDb.users.filter(u => u.role === 'recruiter').length;
        const totalStudents = mockDb.users.filter(u => u.role === 'student').length;
        const totalProjects = mockDb.projects.filter(p => p.deleted_at === null).length;
        const pendingProjects = mockDb.projects.filter(p => p.status === 'pending' && p.deleted_at === null).length;
        const approvedProjects = mockDb.projects.filter(p => p.status === 'approved' && p.deleted_at === null).length;
        const rejectedProjects = mockDb.projects.filter(p => p.status === 'rejected' && p.deleted_at === null).length;
        const totalLikes = mockDb.likes.length;
        const totalFollowers = mockDb.followers.length;
        const suspendedUsers = mockDb.users.filter(u => u.status === 'suspended').length;

        stats = {
          totalUsers,
          totalRecruiters,
          totalStudents,
          totalProjects,
          pendingProjects,
          approvedProjects,
          rejectedProjects,
          totalLikes,
          totalFollowers,
          suspendedUsers
        };
      } else {
        const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
        const [[{ totalRecruiters }]] = await pool.query("SELECT COUNT(*) as totalRecruiters FROM users WHERE role = 'recruiter'");
        const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM users WHERE role = 'student'");
        const [[{ totalProjects }]] = await pool.query('SELECT COUNT(*) as totalProjects FROM projects WHERE deleted_at IS NULL');
        const [[{ pendingProjects }]] = await pool.query("SELECT COUNT(*) as pendingProjects FROM projects WHERE status = 'pending' AND deleted_at IS NULL");
        const [[{ approvedProjects }]] = await pool.query("SELECT COUNT(*) as approvedProjects FROM projects WHERE status = 'approved' AND deleted_at IS NULL");
        const [[{ rejectedProjects }]] = await pool.query("SELECT COUNT(*) as rejectedProjects FROM projects WHERE status = 'rejected' AND deleted_at IS NULL");
        const [[{ totalLikes }]] = await pool.query('SELECT COUNT(*) as totalLikes FROM likes');
        const [[{ totalFollowers }]] = await pool.query('SELECT COUNT(*) as totalFollowers FROM followers');
        const [[{ suspendedUsers }]] = await pool.query("SELECT COUNT(*) as suspendedUsers FROM users WHERE status = 'suspended'");

        stats = {
          totalUsers,
          totalRecruiters,
          totalStudents,
          totalProjects,
          pendingProjects,
          approvedProjects,
          rejectedProjects,
          totalLikes,
          totalFollowers,
          suspendedUsers
        };
      }

      res.status(200).json({
        success: true,
        message: 'Admin statistics loaded.',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  async getAuditLogs(req, res, next) {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
      const offset = (page - 1) * limit;

      const result = await auditLogRepository.list(limit, offset);

      res.status(200).json({
        success: true,
        message: 'Audit logs retrieved.',
        data: {
          logs: result.rows,
          pagination: {
            total_items: result.count,
            current_page: page,
            limit
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.user.id;

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User account not found.' } });
      }

      await userRepository.updateStatus(id, status);

      // Log action in audit trail
      await auditLogRepository.log(
        adminId, 
        status === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER', 
        'user', 
        id, 
        `User account set to status: ${status}`, 
        req.ip
      );

      // Send student/recruiter notification
      await notificationRepository.create({
        recipientId: id,
        senderId: adminId,
        type: 'system',
        entityId: null,
        message: `Your account has been ${status === 'suspended' ? 'suspended' : 'reactivated'} by an administrator.`
      });

      res.status(200).json({
        success: true,
        message: `User status changed to ${status}.`
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUserPrivilege(req, res, next) {
    try {
      const { id } = req.params;
      const { disabled } = req.body;
      const adminId = req.user.id;

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User account not found.' } });
      }

      await userRepository.updateSubmissionDisabled(id, disabled);

      // Log action in audit trail
      await auditLogRepository.log(
        adminId, 
        disabled ? 'DISABLE_SUBMISSION' : 'ENABLE_SUBMISSION', 
        'user', 
        id, 
        disabled ? 'Project submission privileges disabled' : 'Project submission privileges enabled', 
        req.ip
      );

      // Send student notification
      await notificationRepository.create({
        recipientId: id,
        senderId: adminId,
        type: 'system',
        entityId: null,
        message: `Your project submission privileges have been ${disabled ? 'suspended' : 'restored'} by an administrator.`
      });

      res.status(200).json({
        success: true,
        message: `Submission disabled state updated to ${disabled}.`
      });
    } catch (error) {
      next(error);
    }
  },

  async moderateProject(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = req.user.id;

      // Find the project (including soft deleted)
      const project = await projectRepository.findByIdIncludeSoftDeleted(id);
      if (!project) {
        return res.status(404).json({ success: false, error: { message: 'Project not found.' } });
      }

      if (env.MOCK_DATABASE) {
        const proj = mockDb.projects.find(p => String(p.id) === String(id));
        if (proj) {
          proj.status = status;
          proj.rejection_reason = reason || null;
          proj.updated_at = new Date().toISOString();
        }
      } else {
        await pool.query(
          'UPDATE projects SET status = ?, rejection_reason = ? WHERE id = ?',
          [status, reason || null, id]
        );
      }

      // Log action in audit trail
      const actionType = status === 'approved' ? 'APPROVE_PROJECT' : 'REJECT_PROJECT';
      const logDescription = status === 'approved' 
        ? 'Project status set to: approved' 
        : `Project status set to: rejected. Reason: ${reason || 'None'}`;

      await auditLogRepository.log(
        adminId, 
        actionType, 
        'project', 
        id, 
        logDescription, 
        req.ip
      );

      // Send notification to the student (owner)
      const studentId = project.student_id;
      const projectTitle = project.title;

      let msg = `Your project "${projectTitle}" has been ${status === 'approved' ? 'approved and published' : 'rejected'}.`;
      if (status === 'rejected' && reason) {
        msg += ` Reason: ${reason}`;
      }

      await notificationRepository.create({
        recipientId: studentId,
        senderId: adminId,
        type: 'system',
        entityId: id,
        message: msg
      });

      // Notify followers if approved
      if (status === 'approved') {
        const followRepository = require('../repositories/followRepository');
        const followers = await followRepository.findFollowers(studentId);
        if (followers && followers.length > 0) {
          for (const follower of followers) {
            await notificationRepository.create({
              recipientId: follower.id,
              senderId: studentId,
              type: 'project_published',
              entityId: id,
              message: `A student you follow published a new project: "${projectTitle}".`
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        message: `Project status moderated to ${status}.`
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const project = await projectRepository.findByIdIncludeSoftDeleted(id);
      if (!project) {
        return res.status(404).json({ success: false, error: { message: 'Project not found.' } });
      }

      await projectRepository.hardDelete(id);

      // Log action in audit trail
      await auditLogRepository.log(
        adminId, 
        'DELETE_PROJECT', 
        'project', 
        id, 
        `Project permanently removed/archived: ${project.title}`, 
        req.ip
      );

      // Send notification to the student (owner)
      await notificationRepository.create({
        recipientId: project.student_id,
        senderId: adminId,
        type: 'system',
        entityId: null,
        message: `Your project "${project.title}" has been removed from the platform by a moderator.`
      });

      res.status(200).json({
        success: true,
        message: 'Project removed successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const adminId = req.user.id;
      const { newPassword } = req.body;

      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);

      if (env.MOCK_DATABASE) {
        const admin = mockDb.users.find(u => String(u.id) === String(adminId));
        if (admin) {
          admin.password_hash = hash;
        }
      } else {
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, adminId]);
      }

      // Log the password change action
      await auditLogRepository.log(
        adminId,
        'CHANGE_PASSWORD',
        'user',
        adminId,
        'Administrator changed their account password.',
        req.ip
      );

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserDetails(req, res, next) {
    try {
      const { id } = req.params;
      
      let user = null;
      if (env.MOCK_DATABASE) {
        user = mockDb.users.find(u => String(u.id) === String(id));
      } else {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        user = rows[0] || null;
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User account not found.' }
        });
      }

      const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status || 'active',
        submission_disabled: !!user.submission_disabled,
        profile_picture_url: user.profile_picture_url,
        student_id: user.student_id,
        recruiter_id: user.recruiter_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      let projects = [];
      let followersList = [];
      let followingList = [];
      let likesCount = 0;
      let followingCount = 0;
      let followersCount = 0;

      if (user.role === 'student') {
        if (env.MOCK_DATABASE) {
          projects = mockDb.projects.filter(p => String(p.student_id) === String(id) && p.deleted_at === null);
          const projectIds = projects.map(p => String(p.id));
          likesCount = mockDb.likes.filter(l => projectIds.includes(String(l.project_id))).length;
          
          const followerIds = mockDb.followers.filter(f => String(f.following_id) === String(id)).map(f => String(f.follower_id));
          followersList = mockDb.users.filter(u => followerIds.includes(String(u.id))).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            profile_picture_url: u.profile_picture_url,
            recruiter_id: u.recruiter_id
          }));
          followersCount = followersList.length;
        } else {
          const [projRows] = await pool.query('SELECT * FROM projects WHERE student_id = ? AND deleted_at IS NULL', [id]);
          projects = projRows;

          const [[{ count: lCount }]] = await pool.query(
            'SELECT COUNT(*) as count FROM likes l JOIN projects p ON l.project_id = p.id WHERE p.student_id = ? AND p.deleted_at IS NULL',
            [id]
          );
          likesCount = lCount;

          const [followerRows] = await pool.query(
            'SELECT u.id, u.name, u.email, u.profile_picture_url, u.recruiter_id FROM users u JOIN followers f ON u.id = f.follower_id WHERE f.following_id = ?',
            [id]
          );
          followersList = followerRows;
          followersCount = followersList.length;
        }
      } else if (user.role === 'recruiter') {
        if (env.MOCK_DATABASE) {
          likesCount = mockDb.likes.filter(l => String(l.user_id) === String(id)).length;
          
          const followingIds = mockDb.followers.filter(f => String(f.follower_id) === String(id)).map(f => String(f.following_id));
          followingList = mockDb.users.filter(u => followingIds.includes(String(u.id))).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            profile_picture_url: u.profile_picture_url,
            student_id: u.student_id
          }));
          followingCount = followingList.length;
        } else {
          const [[{ count: lCount }]] = await pool.query('SELECT COUNT(*) as count FROM likes WHERE user_id = ?', [id]);
          likesCount = lCount;

          const [followingRows] = await pool.query(
            'SELECT u.id, u.name, u.email, u.profile_picture_url, u.student_id FROM users u JOIN followers f ON u.id = f.following_id WHERE f.follower_id = ?',
            [id]
          );
          followingList = followingRows;
          followingCount = followingList.length;
        }
      }

      res.status(200).json({
        success: true,
        message: 'User details retrieved.',
        data: {
          user: userProfile,
          projects,
          followers: followersList,
          following: followingList,
          stats: {
            likesCount,
            followingCount,
            followersCount
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
