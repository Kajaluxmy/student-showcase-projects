const projectRepository = require('../repositories/projectRepository');
const userRepository = require('../repositories/userRepository');
const eventBroker = require('../events/eventBroker');

const projectService = {
  async createProject(studentId, projectData) {
    const { title, description, technologyStack, thumbnailUrl, githubUrl } = projectData;

    // Check if user has project submission privileges suspended
    const user = await userRepository.findById(studentId);
    if (user && user.submission_disabled) {
      const error = new Error('Your project submission privileges have been suspended by an administrator.');
      error.statusCode = 403;
      error.code = 'SUBMISSION_PRIVILEGES_SUSPENDED';
      throw error;
    }

    const project = await projectRepository.create({
      studentId,
      title,
      description,
      technologyStack,
      thumbnailUrl,
      githubUrl
    });

    // Decoupled asynchronous side-effect execution
    eventBroker.emitSafe('ProjectCreated', {
      projectId: project.id,
      studentId,
      projectTitle: title,
      timestamp: new Date()
    });

    return project;
  },

  async getProjectById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found or has been removed.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }
    return project;
  },

  async updateProject(id, studentId, projectData) {
    const project = await projectRepository.findById(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    if (String(project.student_id) !== String(studentId)) {
      const error = new Error('Unauthorized. You are not the owner of this project.');
      error.statusCode = 403;
      error.code = 'OWNERSHIP_MISMATCH';
      throw error;
    }

    return projectRepository.update(id, {
      title: projectData.title || project.title,
      description: projectData.description || project.description,
      technologyStack: projectData.technologyStack || project.technology_stack,
      thumbnailUrl: projectData.thumbnailUrl || project.thumbnail_url,
      githubUrl: projectData.githubUrl !== undefined ? projectData.githubUrl : project.github_url
    });
  },

  async deleteProject(id, user) {
    const project = await projectRepository.findByIdIncludeSoftDeleted(id);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    const isOwner = String(project.student_id) === String(user.id);
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Unauthorized. You do not have permissions to delete this project.');
      error.statusCode = 403;
      error.code = 'DELETE_DENIED';
      throw error;
    }

    await projectRepository.softDelete(id);
    console.log(`🗑️  Project ID ${id} soft-deleted by ${user.role} ID: ${user.id}`);
    
    return true;
  },

  async listProjects(filters) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 12));
    const offset = (page - 1) * limit;

    const options = {
      limit,
      offset,
      search: filters.search || null,
      tech: filters.tech || null,
      studentId: filters.studentId || null,
      likedByUserId: filters.likedByUserId || null,
      sort: filters.sort || 'newest',
      includeDeleted: filters.includeDeleted || false,
      status: filters.status || null,
      adminView: filters.adminView === 'true' || filters.adminView === true
    };

    return projectRepository.findAndCountAll(options);
  }
};

module.exports = projectService;
