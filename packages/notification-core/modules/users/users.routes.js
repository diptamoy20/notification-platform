const { getUsersQuerySchema } = require('./users.validation');
const { updateChannelsSchema, replaceChannelsSchema } = require('./channels.validation');

function createUsersRouter(dbAdapter, { success, badRequest, notFound, asyncHandler, Router }) {
  const router = Router();

  // ── Handlers ─────────────────────────────────────────────────────────────
  
  const getUsers = async (req, res) => {
    const result = getUsersQuerySchema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return badRequest(res, 'Invalid query parameters', errors);
    }
    const data = await dbAdapter.getUsers(result.data);
    return success(res, data, 'Users fetched successfully');
  };

  const getChannels = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return badRequest(res, 'User id must be a valid integer');

    const user = await dbAdapter.getUserById(userId);
    if (!user) return notFound(res, `User with id ${userId} not found`);

    return success(res, user, 'Channel preferences fetched successfully');
  };

  const replaceChannels = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return badRequest(res, 'User id must be a valid integer');

    const result = replaceChannelsSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return badRequest(res, 'Invalid channel preferences', errors);
    }

    const user = await dbAdapter.getUserById(userId);
    if (!user) return notFound(res, `User with id ${userId} not found`);

    const updated = await dbAdapter.updateUserChannels(userId, result.data);
    return success(res, updated, 'Channel preferences updated successfully');
  };

  const patchChannels = async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) return badRequest(res, 'User id must be a valid integer');

    const result = updateChannelsSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return badRequest(res, 'Invalid channel preferences', errors);
    }

    const user = await dbAdapter.getUserById(userId);
    if (!user) return notFound(res, `User with id ${userId} not found`);

    const updated = await dbAdapter.updateUserChannels(userId, result.data);
    return success(res, updated, 'Channel preferences patched successfully');
  };

  // ── Routes ───────────────────────────────────────────────────────────────
  
  router.get('/', asyncHandler(getUsers));
  router.get('/:id/channels', asyncHandler(getChannels));
  router.put('/:id/channels', asyncHandler(replaceChannels));
  router.patch('/:id/channels', asyncHandler(patchChannels));

  return router;
}

module.exports = { createUsersRouter };
