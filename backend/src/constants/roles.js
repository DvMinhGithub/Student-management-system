const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
};

const toModelName = (role) =>
  role ? role.charAt(0).toUpperCase() + role.slice(1) : role;

const MODEL_NAMES = {
  ADMIN: toModelName(ROLES.ADMIN),
  TEACHER: toModelName(ROLES.TEACHER),
  STUDENT: toModelName(ROLES.STUDENT),
};

module.exports = { ROLES, MODEL_NAMES };
