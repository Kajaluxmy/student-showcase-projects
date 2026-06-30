const projectService = require('../services/projectService');
const likeService = require('../services/likeService');
const fs = require('fs');
const { cloudinary, isConfigured: isCloudinaryConfigured } = require('../config/cloudinary');

const projectController = {
  async create(req, res, next) {
    try {
      const studentId = req.user.id;
      // Handle optional file uploads path logic from uploadMiddleware if active
      let thumbnailUrl = req.body.thumbnailUrl;
      if (req.file) {
        if (isCloudinaryConfigured) {
          try {
            console.log('☁️  Uploading project thumbnail to Cloudinary...');
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'student_showcase_projects',
              resource_type: 'image'
            });
            thumbnailUrl = result.secure_url;
            console.log('✅ Cloudinary upload successful:', thumbnailUrl);
            
            // Remove local file since upload succeeded
            try { fs.unlinkSync(req.file.path); } catch (err) {}
          } catch (uploadError) {
            console.error('❌ Cloudinary upload failed:', uploadError.message);
            thumbnailUrl = `/uploads/${req.file.filename}`;
          }
        } else {
          thumbnailUrl = `/uploads/${req.file.filename}`;
        }
      }

      const projectData = {
        title: req.body.title,
        description: req.body.description,
        technologyStack: req.body.technologyStack,
        thumbnailUrl,
        githubUrl: req.body.githubUrl || null
      };

      const project = await projectService.createProject(studentId, projectData);
      
      res.status(201).json({
        success: true,
        message: 'Project published successfully.',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const result = await projectService.listProjects(req.query);
      res.status(200).json({
        success: true,
        message: 'Projects listed successfully.',
        data: {
          projects: result.rows,
          pagination: {
            total_items: result.count,
            current_page: req.query.page || 1,
            limit: req.query.limit || 12
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      res.status(200).json({
        success: true,
        message: 'Project details retrieved.',
        data: { project }
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const studentId = req.user.id;

      let thumbnailUrl = req.body.thumbnailUrl;
      if (req.file) {
        if (isCloudinaryConfigured) {
          try {
            console.log('☁️  Uploading project thumbnail to Cloudinary...');
            const result = await cloudinary.uploader.upload(req.file.path, {
              folder: 'student_showcase_projects',
              resource_type: 'image'
            });
            thumbnailUrl = result.secure_url;
            console.log('✅ Cloudinary upload successful:', thumbnailUrl);
            
            // Remove local file since upload succeeded
            try { fs.unlinkSync(req.file.path); } catch (err) {}
          } catch (uploadError) {
            console.error('❌ Cloudinary upload failed:', uploadError.message);
            thumbnailUrl = `/uploads/${req.file.filename}`;
          }
        } else {
          thumbnailUrl = `/uploads/${req.file.filename}`;
        }
      }

      const projectData = {
        title: req.body.title,
        description: req.body.description,
        technologyStack: req.body.technologyStack,
        thumbnailUrl,
        githubUrl: req.body.githubUrl
      };

      const updatedProject = await projectService.updateProject(id, studentId, projectData);

      res.status(200).json({
        success: true,
        message: 'Project profile updated successfully.',
        data: { project: updatedProject }
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await projectService.deleteProject(id, req.user);
      
      res.status(200).json({
        success: true,
        message: 'Project removed successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  async like(req, res, next) {
    try {
      const { id } = req.params; // project ID
      const userId = req.user.id;
      const userName = req.user.name;

      await likeService.likeProject(userId, userName, id);

      res.status(200).json({
        success: true,
        message: 'Project liked successfully.',
        data: { liked: true }
      });
    } catch (error) {
      next(error);
    }
  },

  async unlike(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await likeService.unlikeProject(userId, id);

      res.status(200).json({
        success: true,
        message: 'Project unliked successfully.',
        data: { liked: false }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
