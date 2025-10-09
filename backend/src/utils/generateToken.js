const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role, // ✅ thêm quyền vào payload
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // tùy bạn muốn 1d, 7d…
  );
};

module.exports = generateToken;
