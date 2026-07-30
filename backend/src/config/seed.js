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

  // Never overwrite an existing super admin's email/password — they manage those in Settings.
  const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
  if (existingSuperAdmin) {
    if (!existingSuperAdmin.isEmailVerified) {
      existingSuperAdmin.isEmailVerified = true;
      await existingSuperAdmin.save();
    }
    console.log(`[seed] Super admin already exists (${existingSuperAdmin.email})`);
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
