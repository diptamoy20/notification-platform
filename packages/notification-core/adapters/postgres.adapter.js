/**
 * Postgres/Prisma implementation of the dbAdapter interface.
 * 
 * @param {import('@prisma/client').PrismaClient} prisma - The injected Prisma client instance.
 * @returns {Object} The dbAdapter interface implementation.
 */
module.exports = function createPostgresAdapter(prisma) {
  return {
    /**
     * @param {Object} params
     * @param {string} params.search
     * @param {number} params.page
     * @param {number} params.limit
     */
    async getUsers({ search = '', page = 1, limit = 20 }) {
      const skip = (page - 1) * limit;
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { mobileNumber: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { id: 'asc' },
          select: {
            id: true,
            name: true,
            mobileNumber: true,
            email: true,
            sms: true,
            emailChannel: true,
            whatsapp: true,
            inapp: true,
            push: true,
            fcmToken: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async getUserById(id) {
      return prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          mobileNumber: true,
          email: true,
          sms: true,
          emailChannel: true,
          whatsapp: true,
          inapp: true,
          push: true,
          fcmToken: true,
          updatedAt: true,
        },
      });
    },

    async getUserByIdentifier(identifier) {
      return prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { mobileNumber: identifier },
          ],
        },
        select: {
          id: true,
          name: true,
          mobileNumber: true,
          email: true,
        },
      });
    },

    async getUsersByIds(ids) {
      return prisma.user.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          name: true,
          email: true,
          mobileNumber: true,
          sms: true,
          emailChannel: true,
          whatsapp: true,
          inapp: true,
          push: true,
          fcmToken: true,
        },
      });
    },

    async updateUserChannels(id, data) {
      return prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          mobileNumber: true,
          email: true,
          sms: true,
          emailChannel: true,
          whatsapp: true,
          inapp: true,
          push: true,
          fcmToken: true,
          updatedAt: true,
        },
      });
    },

    async saveNotificationLog(logEntry) {
      return prisma.notificationLog.create({
        data: {
          userId: logEntry.userId,
          channel: logEntry.channel,
          message: logEntry.message,
          status: logEntry.status,
          error: logEntry.error,
        },
      });
    },

    async getNotificationLogs({ page = 1, limit = 50 }) {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.notificationLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true, mobileNumber: true } },
          },
        }),
        prisma.notificationLog.count(),
      ]);

      return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    /**
     * Update the FCM device token for a user.
     * Called from the React Native app when the device registers/refreshes its FCM token.
     */
    async updateFcmToken(id, fcmToken) {
      return prisma.user.update({
        where: { id },
        data: { fcmToken },
        select: {
          id: true,
          name: true,
          fcmToken: true,
        },
      });
    },

    async getTemplateByKey(key) {
      return prisma.notificationTemplate.findUnique({
        where: { key }
      });
    }
  };
};
