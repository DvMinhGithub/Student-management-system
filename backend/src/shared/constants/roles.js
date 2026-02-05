const ROLE_MAP = Object.freeze({
  ADMIN: { model: "Admin", role: "admin", code: "AD" },
  TEACHER: { model: "Teacher", role: "teacher", code: "GV" },
  STUDENT: { model: "Student", role: "student", code: "SV" },
});

module.exports = { ROLE_MAP };