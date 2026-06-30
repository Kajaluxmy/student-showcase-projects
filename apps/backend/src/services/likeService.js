const likeRepository = require('../repositories/likeRepository');
const projectRepository = require('../repositories/projectRepository');
const eventBroker = require('../events/eventBroker');

const likeService = {
  async likeProject(userId, userName, projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    const alreadyLiked = await likeRepository.exists(userId, projectId);
    if (alreadyLiked) {
      const error = new Error('You have already liked this project.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_LIKE';
      throw error;
    }

    await likeRepository.insert(userId, projectId);

    // Decoupled asynchronous notification triggering
    eventBroker.emitSafe('ProjectLiked', {
      projectId,
      likerId: userId,
      projectOwnerId: project.student_id,
      projectTitle: project.title,
      likerName: userName,
      timestamp: new Date()
    });

    return true;
  },

  async unlikeProject(userId, projectId) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      const error = new Error('Project not found.');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      throw error;
    }

    const liked = await likeRepository.exists(userId, projectId);
    if (!liked) {
      const error = new Error('You have not liked this project.');
      error.statusCode = 400;
      error.code = 'LIKE_NOT_FOUND';
      throw error;
    }

    await likeRepository.delete(userId, projectId);
    return true;
  }
};

module.exports = likeService;
