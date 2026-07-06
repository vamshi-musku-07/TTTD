const User = require('../models/User');

const SUPER_ADMIN = {
  email: 'vishnu@gmail.com',
  password: 'EagleEye#2026',
  firstName: 'Vishnu',
  lastName: 'Admin',
  role: 'super_admin',
};

const LEGACY_SEED_EMAILS = ['superadmin@mediaflow.app', 'admin@mediaflow.app'];

async function removeLegacySeedUsers() {
  const result = await User.deleteMany({ email: { $in: LEGACY_SEED_EMAILS } });
  if (result.deletedCount > 0) {
    console.log(`[seed] Removed ${result.deletedCount} legacy seed admin account(s)`);
  }
}

async function seedSuperAdmin() {
  await removeLegacySeedUsers();

  const existing = await User.findOne({ email: SUPER_ADMIN.email });
  if (existing) {
    existing.role = 'super_admin';
    existing.password = SUPER_ADMIN.password;
    existing.isEmailVerified = true;
    await existing.save();
    console.log('[seed] Ensured super admin account for vishnu@gmail.com');
    return;
  }

  await User.create({
    email: SUPER_ADMIN.email,
    password: SUPER_ADMIN.password,
    firstName: SUPER_ADMIN.firstName,
    lastName: SUPER_ADMIN.lastName,
    role: SUPER_ADMIN.role,
    isEmailVerified: true,
    acceptedTermsAt: new Date(),
  });

  console.log('[seed] Created super admin: vishnu@gmail.com');
}

module.exports = { seedSuperAdmin };
