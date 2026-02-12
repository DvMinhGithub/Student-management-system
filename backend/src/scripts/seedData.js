require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const config = require("#shared/config/index.js");
const { ROLE_MAP } = require("#shared/constants/roles.js");

const Account = require("#modules/account/accountModel.js");
const Admin = require("#modules/admin/adminModel.js");
const Teacher = require("#modules/teacher/teacherModel.js");
const Student = require("#modules/student/studentModel.js");
const Course = require("#modules/course/courseModel.js");
const Semester = require("#modules/semester/semesterModel.js");

const SHOULD_RESET = process.argv.includes("--reset");
const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "12345678";
const ADMIN_ROLE = ROLE_MAP.ADMIN.role;
const TEACHER_ROLE = ROLE_MAP.TEACHER.role;
const STUDENT_ROLE = ROLE_MAP.STUDENT.role;

const semesterSeeds = [
  {
    code: "HK12025",
    name: "Học kỳ 1 năm học 2025-2026",
    startDate: new Date("2025-08-18"),
    endDate: new Date("2025-12-28"),
  },
  {
    code: "HK22025",
    name: "Học kỳ 2 năm học 2025-2026",
    startDate: new Date("2026-01-05"),
    endDate: new Date("2026-05-24"),
  },
  {
    code: "HK32025",
    name: "Học kỳ hè năm học 2025-2026",
    startDate: new Date("2026-06-08"),
    endDate: new Date("2026-08-16"),
  },
];

const courseSeeds = [
  { code: "CNTT101", name: "Nhập môn lập trình", credits: 3, semesters: ["HK12025"] },
  { code: "CNTT102", name: "Cấu trúc dữ liệu và giải thuật", credits: 4, semesters: ["HK12025"] },
  { code: "CNTT103", name: "Lập trình hướng đối tượng", credits: 3, semesters: ["HK12025"] },
  { code: "CNTT104", name: "Cơ sở dữ liệu", credits: 3, semesters: ["HK12025"] },
  { code: "CNTT105", name: "Hệ điều hành", credits: 3, semesters: ["HK22025"] },
  { code: "CNTT106", name: "Mạng máy tính", credits: 3, semesters: ["HK22025"] },
  { code: "CNTT107", name: "Lập trình Web", credits: 3, semesters: ["HK22025"] },
  { code: "CNTT108", name: "Công nghệ phần mềm", credits: 3, semesters: ["HK22025"] },
  { code: "CNTT109", name: "Phân tích thiết kế hệ thống", credits: 3, semesters: ["HK22025"] },
  { code: "CNTT110", name: "Kiểm thử phần mềm", credits: 3, semesters: ["HK32025"] },
  { code: "CNTT111", name: "Điện toán đám mây", credits: 3, semesters: ["HK32025"] },
  { code: "CNTT112", name: "Trí tuệ nhân tạo", credits: 3, semesters: ["HK32025"] },
  { code: "MATH101", name: "Giải tích 1", credits: 3, semesters: ["HK12025"] },
  { code: "MATH102", name: "Đại số tuyến tính", credits: 3, semesters: ["HK12025"] },
  { code: "MATH201", name: "Xác suất thống kê", credits: 3, semesters: ["HK22025"] },
  { code: "PHYS101", name: "Vật lý đại cương", credits: 2, semesters: ["HK12025"] },
  { code: "ENG101", name: "Tiếng Anh học thuật 1", credits: 2, semesters: ["HK12025"] },
  { code: "ENG102", name: "Tiếng Anh học thuật 2", credits: 2, semesters: ["HK22025"] },
  { code: "BUS101", name: "Kỹ năng giao tiếp", credits: 2, semesters: ["HK12025"] },
  { code: "LAW101", name: "Pháp luật đại cương", credits: 2, semesters: ["HK22025"] },
  { code: "ECON101", name: "Kinh tế vi mô", credits: 2, semesters: ["HK22025"] },
  { code: "PE101", name: "Giáo dục thể chất 1", credits: 1, semesters: ["HK12025"] },
  { code: "PE102", name: "Giáo dục thể chất 2", credits: 1, semesters: ["HK22025"] },
  { code: "PROJ201", name: "Đồ án cơ sở ngành", credits: 3, semesters: ["HK32025"] },
];

const teacherSeeds = [
  { name: "Nguyễn Hoàng Anh", gender: "Nam", address: "Quận Cầu Giấy, Hà Nội" },
  { name: "Trần Minh Tâm", gender: "Nam", address: "Quận Thanh Xuân, Hà Nội" },
  { name: "Lê Thu Hà", gender: "Nữ", address: "Quận Hai Bà Trưng, Hà Nội" },
  { name: "Phạm Gia Bảo", gender: "Nam", address: "Quận 3, TP. Hồ Chí Minh" },
  { name: "Đỗ Ngọc Lan", gender: "Nữ", address: "Quận Bình Thạnh, TP. Hồ Chí Minh" },
  { name: "Võ Quốc Hưng", gender: "Nam", address: "Quận Hải Châu, Đà Nẵng" },
  { name: "Bùi Thanh Vân", gender: "Nữ", address: "Quận Sơn Trà, Đà Nẵng" },
  { name: "Phan Đức Khải", gender: "Nam", address: "TP. Nha Trang, Khánh Hòa" },
  { name: "Ngô Thị Hồng", gender: "Nữ", address: "TP. Huế, Thừa Thiên Huế" },
  { name: "Đặng Quang Vinh", gender: "Nam", address: "TP. Biên Hòa, Đồng Nai" },
  { name: "Trương Mỹ Linh", gender: "Nữ", address: "TP. Cần Thơ" },
  { name: "Hồ Tuấn Kiệt", gender: "Nam", address: "TP. Vinh, Nghệ An" },
];

const adminSeeds = [
  { name: "Lê Hữu Phúc", gender: "Nam", address: "Quận Nam Từ Liêm, Hà Nội", placeOfBirth: "Nghệ An" },
  { name: "Nguyễn Thị Ánh Tuyết", gender: "Nữ", address: "TP. Thủ Đức, TP. Hồ Chí Minh", placeOfBirth: "Bến Tre" },
  { name: "Trần Gia Huy", gender: "Nam", address: "Quận Hải Châu, Đà Nẵng", placeOfBirth: "Quảng Nam" },
];

const ho = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô"];
const dem = ["Văn", "Thị", "Ngọc", "Gia", "Minh", "Thanh", "Quốc", "Hoài", "Đức", "Khánh", "Phương", "Xuân"];
const ten = [
  "An",
  "Bình",
  "Châu",
  "Dung",
  "Duy",
  "Giang",
  "Hà",
  "Hải",
  "Hiếu",
  "Hùng",
  "Khánh",
  "Khoa",
  "Lâm",
  "Lan",
  "Linh",
  "Long",
  "Mai",
  "My",
  "Nam",
  "Ngân",
  "Ngọc",
  "Nhi",
  "Phúc",
  "Phương",
  "Quân",
  "Quỳnh",
  "Sơn",
  "Thảo",
  "Trang",
  "Trâm",
  "Trí",
  "Tuấn",
  "Uyên",
  "Việt",
  "Vy",
];
const provinces = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Quảng Ninh",
  "Huế",
  "Nghệ An",
  "Thanh Hóa",
  "Bình Định",
  "Khánh Hòa",
  "Đắk Lắk",
  "Cần Thơ",
  "An Giang",
  "Đồng Nai",
  "Bình Dương",
];
const addresses = [
  "Quận Cầu Giấy, Hà Nội",
  "Quận Hai Bà Trưng, Hà Nội",
  "Quận Thanh Xuân, Hà Nội",
  "TP. Thủ Đức, TP. Hồ Chí Minh",
  "Quận Gò Vấp, TP. Hồ Chí Minh",
  "Quận Bình Thạnh, TP. Hồ Chí Minh",
  "Quận Hải Châu, Đà Nẵng",
  "Quận Sơn Trà, Đà Nẵng",
  "TP. Biên Hòa, Đồng Nai",
  "TP. Cần Thơ",
];

const pad = (num, size) => String(num).padStart(size, "0");

const pickCyclic = (arr, startIndex, count, step) => {
  const items = [];
  let idx = startIndex;
  for (let i = 0; i < count; i += 1) {
    items.push(arr[idx % arr.length]);
    idx += step;
  }
  return items;
};

const upsertDoc = (Model, filter, setData) =>
  Model.findOneAndUpdate(
    filter,
    { $set: setData },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const createStudentSeed = (count) => {
  const students = [];
  for (let i = 0; i < count; i += 1) {
    const code = `SV2501${pad(i + 1, 3)}`;
    const name = `${ho[i % ho.length]} ${dem[(i * 2) % dem.length]} ${ten[(i * 3) % ten.length]}`;
    const email = `sv${pad(i + 1, 3)}@demo.edu.vn`;
    const gender = i % 3 === 0 ? "Nam" : i % 3 === 1 ? "Nữ" : "Khác";
    const phone = `09${pad(10000000 + i, 8)}`;
    const dateOfBirth = new Date(2003 + (i % 4), i % 12, 1 + (i % 28));
    students.push({
      code,
      name,
      email,
      gender,
      phone,
      address: addresses[i % addresses.length],
      placeOfBirth: provinces[i % provinces.length],
      dateOfBirth,
    });
  }
  return students;
};

const upsertAccount = ({
  username,
  passwordHash,
  role,
  adminId,
  teacherId,
  studentId,
}) =>
  Account.findOneAndUpdate(
    { username },
    {
      $set: {
        username,
        password: passwordHash,
        role,
        isDelete: false,
        refreshToken: null,
        admin: adminId || undefined,
        teacher: teacherId || undefined,
        student: studentId || undefined,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

const clearCollections = async () => {
  await Promise.all([
    Account.deleteMany({}),
    Admin.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    Course.deleteMany({}),
    Semester.deleteMany({}),
  ]);
};

const main = async () => {
  if (!config.mongodbUri) {
    throw new Error("Thiếu MONGODB_URI trong biến môi trường.");
  }

  await mongoose.connect(config.mongodbUri);
  console.log(`Đã kết nối MongoDB: ${config.mongodbUri}`);

  if (SHOULD_RESET) {
    await clearCollections();
    console.log("Đã xóa dữ liệu cũ ở các collection chính.");
  }

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const semesterDocs = {};
  for (const semester of semesterSeeds) {
    const doc = await upsertDoc(Semester, { code: semester.code }, semester);
    semesterDocs[semester.code] = doc;
  }

  const courseDocs = {};
  for (const course of courseSeeds) {
    const semesterIds = course.semesters.map((code) => semesterDocs[code]._id);
    const doc = await upsertDoc(Course, { code: course.code }, {
      code: course.code,
      name: course.name,
      credits: course.credits,
      isDelete: false,
      semesters: semesterIds,
    });
    courseDocs[course.code] = doc;
  }

  for (const semester of semesterSeeds) {
    const coursesInSemester = courseSeeds
      .filter((course) => course.semesters.includes(semester.code))
      .map((course) => courseDocs[course.code]._id);
    await Semester.findByIdAndUpdate(semesterDocs[semester.code]._id, {
      $set: { courses: coursesInSemester, isDelete: false },
    });
  }

  const courseList = Object.values(courseDocs);
  const courseTeacherMap = new Map(courseList.map((course) => [String(course._id), []]));
  const courseStudentMap = new Map(courseList.map((course) => [String(course._id), []]));

  for (let i = 0; i < teacherSeeds.length; i += 1) {
    const seed = teacherSeeds[i];
    const code = `GV2501${pad(i + 1, 3)}`;
    const email = `gv${pad(i + 1, 3)}@demo.edu.vn`;
    const phone = `08${pad(20000000 + i, 8)}`;
    const dob = new Date(1980 + (i % 12), (i * 2) % 12, 10 + (i % 16));

    const teacher = await upsertDoc(Teacher, { email }, {
      code,
      name: seed.name,
      email,
      gender: seed.gender,
      phone,
      address: seed.address,
      dob,
      isDelete: false,
    });

    const assignedCourses = pickCyclic(courseList, i * 2, 3 + (i % 2), 3).map(
      (course) => course._id
    );
    await Teacher.findByIdAndUpdate(teacher._id, { $set: { courses: assignedCourses } });

    for (const courseId of assignedCourses) {
      const key = String(courseId);
      courseTeacherMap.get(key).push(teacher._id);
    }

    await upsertAccount({
      username: code,
      passwordHash,
      role: TEACHER_ROLE,
      teacherId: teacher._id,
    });
  }

  for (let i = 0; i < adminSeeds.length; i += 1) {
    const seed = adminSeeds[i];
    const code = `AD2501${pad(i + 1, 3)}`;
    const email = `ad${pad(i + 1, 3)}@demo.edu.vn`;
    const phone = `07${pad(30000000 + i, 8)}`;
    const dateOfBirth = new Date(1985 + i, i, 5 + i);

    const admin = await upsertDoc(Admin, { email }, {
      code,
      name: seed.name,
      email,
      gender: seed.gender,
      phone,
      address: seed.address,
      dateOfBirth,
      placeOfBirth: seed.placeOfBirth,
      isDelete: false,
    });

    const adminAccount = await upsertAccount({
      username: code,
      passwordHash,
      role: ADMIN_ROLE,
      adminId: admin._id,
    });

    await Admin.findByIdAndUpdate(admin._id, { $set: { account: adminAccount._id } });
  }

  const studentSeeds = createStudentSeed(120);
  for (let i = 0; i < studentSeeds.length; i += 1) {
    const seed = studentSeeds[i];
    const student = await upsertDoc(Student, { email: seed.email }, {
      ...seed,
      isDelete: false,
    });

    const assignedCourses = pickCyclic(courseList, i, 4 + (i % 3), 2).map(
      (course) => course._id
    );
    await Student.findByIdAndUpdate(student._id, { $set: { courses: assignedCourses } });

    for (const courseId of assignedCourses) {
      const key = String(courseId);
      courseStudentMap.get(key).push(student._id);
    }

    const studentAccount = await upsertAccount({
      username: seed.code,
      passwordHash,
      role: STUDENT_ROLE,
      studentId: student._id,
    });

    await Student.findByIdAndUpdate(student._id, { $set: { account: studentAccount._id } });
  }

  for (const course of courseList) {
    const key = String(course._id);
    await Course.findByIdAndUpdate(course._id, {
      $set: {
        teachers: courseTeacherMap.get(key),
        students: courseStudentMap.get(key),
        isDelete: false,
      },
    });
  }

  const [adminCount, teacherCount, studentCount, courseCount, semesterCount, accountCount] =
    await Promise.all([
      Admin.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      Course.countDocuments(),
      Semester.countDocuments(),
      Account.countDocuments(),
    ]);

  console.log("Seed thành công.");
  console.log(
    `Tổng dữ liệu: admin=${adminCount}, teacher=${teacherCount}, student=${studentCount}, course=${courseCount}, semester=${semesterCount}, account=${accountCount}`
  );
  console.log(
    `Tài khoản mẫu đăng nhập: AD2501001 / ${DEFAULT_PASSWORD}, GV2501001 / ${DEFAULT_PASSWORD}, SV2501001 / ${DEFAULT_PASSWORD}`
  );
};

main()
  .catch((error) => {
    console.error("Seed thất bại:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
