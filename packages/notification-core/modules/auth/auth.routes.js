const jwt = require('jsonwebtoken');
const { loginSchema } = require('./auth.validation');

function createAuthRouter(dbAdapter, { success, badRequest, notFound, asyncHandler, validate, Router, logger = console, jwtSecret, jwtExpiresIn }) {
  const router = Router();

  const handleLogin = async (req, res) => {
    const { identifier } = req.body;

    const user = await dbAdapter.getUserByIdentifier(identifier);

    if (!user) {
      return badRequest(res, 'Invalid credentials');
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: jwtExpiresIn || '7d',
    });

    return success(res, { token, user }, 'Login successful');
  };

  // const handleLogout = async (req, res) => {
  //   // Since we are using stateless JWTs, true logout happens by deleting the token on the frontend (e.g. from localStorage).
  //   // This endpoint can be used to clear any server-side sessions or cookies if they were implemented in the future.
  //   return success(res, null, 'Logged out successfully');
  // };

  router.post('/login', validate(loginSchema), asyncHandler(handleLogin));
  // router.post('/logout', asyncHandler(handleLogout));

  return router;
}

module.exports = { createAuthRouter };
