const eventBroker = require('./eventBroker');
const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

function registerListeners() {
  
  // 1. ProjectCreated Listener
  eventBroker.on('ProjectCreated', (payload) => {
    setImmediate(async () => {
      try {
        const { projectId, studentId, projectTitle } = payload;
        console.log(`📡 [Event Listener] ProjectCreated triggered for "${projectTitle}" (ID: ${projectId}) by Student ID: ${studentId}`);

        // Fetch student name
        const student = await userRepository.findById(studentId);
        const studentName = student ? student.name : 'A student';

        // Fetch all admins
        const admins = await userRepository.findAdmins();
        const message = `${studentName} published a new project "${projectTitle}" for review.`;

        for (const admin of admins) {
          await notificationRepository.create({
            recipientId: admin.id,
            senderId: studentId,
            type: 'project_submission',
            entityId: projectId,
            message
          });
        }
        console.log(`🔔 Notification generated for admins: "${message}"`);
      } catch (error) {
        console.error('❌ Error in ProjectCreated listener:', error.message);
      }
    });
  });

  // 2. ProjectLiked Listener
  eventBroker.on('ProjectLiked', (payload) => {
    setImmediate(async () => {
      try {
        const { projectId, likerId, projectOwnerId, likerName, projectTitle } = payload;
        console.log(`📡 [Event Listener] ProjectLiked triggered on project ${projectId} by Liker ID: ${likerId}`);

        if (String(likerId) === String(projectOwnerId)) return;

        const message = `${likerName} liked your project "${projectTitle}"`;
        
        await notificationRepository.create({
          recipientId: projectOwnerId,
          senderId: likerId,
          type: 'project_liked',
          entityId: projectId,
          message
        });
        
        console.log(`🔔 Notification generated: "${message}" for Student ID: ${projectOwnerId}`);
      } catch (error) {
        console.error('❌ Error in ProjectLiked listener:', error.message);
      }
    });
  });

  // 3. StudentFollowed Listener
  eventBroker.on('StudentFollowed', (payload) => {
    setImmediate(async () => {
      try {
        const { followerId, followedId, followerName } = payload;
        console.log(`📡 [Event Listener] StudentFollowed triggered: Follower ID ${followerId} -> Followed ID ${followedId}`);

        if (String(followerId) === String(followedId)) return;

        const message = `${followerName} started following you`;
        
        await notificationRepository.create({
          recipientId: followedId,
          senderId: followerId,
          type: 'student_followed',
          entityId: followerId,
          message
        });

        console.log(`🔔 Notification generated: "${message}" for Student ID: ${followedId}`);
      } catch (error) {
        console.error('❌ Error in StudentFollowed listener:', error.message);
      }
    });
  });

  // 4. UserRegistered Listener
  eventBroker.on('UserRegistered', (payload) => {
    setImmediate(async () => {
      try {
        const { userId, name, role } = payload;
        console.log(`📡 [Event Listener] UserRegistered triggered for "${name}" (${role})`);

        const admins = await userRepository.findAdmins();
        const message = `A new ${role} account has been created: ${name}.`;

        for (const admin of admins) {
          await notificationRepository.create({
            recipientId: admin.id,
            senderId: userId,
            type: `${role}_registered`,
            entityId: userId,
            message
          });
        }
        console.log(`🔔 Notification generated for admins: "${message}"`);
      } catch (error) {
        console.error('❌ Error in UserRegistered listener:', error.message);
      }
    });
  });

  console.log('✅ Asynchronous event listeners active.');
}

module.exports = registerListeners;
