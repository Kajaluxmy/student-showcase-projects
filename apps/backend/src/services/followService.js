const followRepository = require('../repositories/followRepository');
const userRepository = require('../repositories/userRepository');
const eventBroker = require('../events/eventBroker');

const followService = {
  async followStudent(followerId, followerName, followingId) {
    if (String(followerId) === String(followingId)) {
      const error = new Error('You cannot follow yourself.');
      error.statusCode = 400;
      error.code = 'SELF_FOLLOW';
      throw error;
    }

    const student = await userRepository.findById(followingId);
    if (!student) {
      const error = new Error('Student profile not found.');
      error.statusCode = 404;
      error.code = 'STUDENT_NOT_FOUND';
      throw error;
    }

    if (student.role !== 'student') {
      const error = new Error('Access denied. You can only follow students.');
      error.statusCode = 400;
      error.code = 'INVALID_TARGET_ROLE';
      throw error;
    }

    const alreadyFollowing = await followRepository.exists(followerId, followingId);
    if (alreadyFollowing) {
      const error = new Error('You are already following this student.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_FOLLOW';
      throw error;
    }

    await followRepository.insert(followerId, followingId);

    // Decoupled asynchronous follower notification triggering
    eventBroker.emitSafe('StudentFollowed', {
      followerId,
      followedId: followingId,
      followerName,
      timestamp: new Date()
    });

    return true;
  },

  async unfollowStudent(followerId, followingId) {
    const following = await followRepository.exists(followerId, followingId);
    if (!following) {
      const error = new Error('You are not following this student.');
      error.statusCode = 400;
      error.code = 'FOLLOW_NOT_FOUND';
      throw error;
    }

    await followRepository.delete(followerId, followingId);
    return true;
  },

  async getFollowingList(followerId) {
    return followRepository.findFollowing(followerId);
  },

  async getFollowersList(followingId) {
    return followRepository.findFollowers(followingId);
  }
};

module.exports = followService;
