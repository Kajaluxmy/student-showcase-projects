const userService = require('../services/userService');
const followService = require('../services/followService');
const fs = require('fs');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');

const userController = {
  // Admin-only listing of all registered users
  async list(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;

      const result = await userService.listUsersForAdmin(page, limit);

      res.status(200).json({
        success: true,
        message: 'Users listed successfully.',
        data: {
          users: result.rows,
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

  // Admin-only modifying user roles
  async changeRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const updatedUser = await userService.changeUserRole(id, role);

      res.status(200).json({
        success: true,
        message: 'User access role updated successfully.',
        data: { user: updatedUser }
      });
    } catch (error) {
      next(error);
    }
  },

  // Recruiter following a student
  async follow(req, res, next) {
    try {
      const { id } = req.params; // student ID
      const followerId = req.user.id;
      const followerName = req.user.name;

      await followService.followStudent(followerId, followerName, id);

      res.status(200).json({
        success: true,
        message: 'Successfully followed student.',
        data: { following: true }
      });
    } catch (error) {
      next(error);
    }
  },

  // Recruiter unfollowing a student
  async unfollow(req, res, next) {
    try {
      const { id } = req.params; // student ID
      const followerId = req.user.id;

      await followService.unfollowStudent(followerId, id);

      res.status(200).json({
        success: true,
        message: 'Successfully unfollowed student.',
        data: { following: false }
      });
    } catch (error) {
      next(error);
    }
  },

  // Retrieve following list
  async getFollowing(req, res, next) {
    try {
      const userId = req.user.id;
      const following = await followService.getFollowingList(userId);
      
      res.status(200).json({
        success: true,
        message: 'Followed student list retrieved.',
        data: { following }
      });
    } catch (error) {
      next(error);
    }
  },

  async getFollowers(req, res, next) {
    try {
      const userId = req.user.id;
      const followers = await followService.getFollowersList(userId);
      
      res.status(200).json({
        success: true,
        message: 'Followers list retrieved.',
        data: { followers }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;
      let { profilePictureUrl } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Display Name cannot be empty.' } });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Email cannot be empty.' } });
      }

      // Handle image upload from device
      if (req.file) {
        if (isCloudinaryConfigured) {
          try {
            console.log('☁️  Uploading profile avatar to Cloudinary...');
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'student_showcase_avatars',
              resource_type: 'image'
            });
            profilePictureUrl = result.secure_url;
            console.log('✅ Cloudinary upload successful:', profilePictureUrl);
            
            // Remove the temporary file from local storage since upload succeeded
            try {
              fs.unlinkSync(req.file.path);
            } catch (err) {
              console.warn('⚠️  Could not clean up temporary upload file:', err.message);
            }
          } catch (uploadError) {
            console.error('❌ Cloudinary upload failed:', uploadError.message);
            // fallback to local path if Cloudinary fails during runtime
            profilePictureUrl = `/uploads/${req.file.filename}`;
          }
        } else {
          // Cloudinary not configured, fallback to local file server
          profilePictureUrl = `/uploads/${req.file.filename}`;
          console.log('💾 Stored avatar locally (Cloudinary offline):', profilePictureUrl);
        }
      }

      const updatedUser = await userService.updateUserProfile(userId, {
        name: name.trim(),
        email: email.trim(),
        profilePictureUrl: profilePictureUrl || null
      });

      const userResponse = {
        id: updatedUser.id,
        googleId: updatedUser.google_id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        profilePictureUrl: updatedUser.profile_picture_url,
        profile_picture_url: updatedUser.profile_picture_url,
        student_id: updatedUser.student_id,
        recruiter_id: updatedUser.recruiter_id,
        status: updatedUser.status,
        created_at: updatedUser.created_at
      };

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        data: { user: userResponse }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
