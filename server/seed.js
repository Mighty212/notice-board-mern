const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Category = require("./models/Category");
const Notice = require("./models/Notice");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Notice.deleteMany(),
    ]);
    console.log("Cleared existing collections.");

    // Seed Categories
    const categories = await Category.insertMany([
      { name: "Academic", description: "Syllabus, lectures, and academic schedules", color: "#2563eb" },
      { name: "Examination", description: "Mid-term, finals, and timetable circulars", color: "#dc2626" },
      { name: "Events", description: "College festivals, workshops, and seminars", color: "#7c3aed" },
      { name: "Placement", description: "Campus recruitment drives and internship notices", color: "#059669" },
      { name: "Sports", description: "Tournaments and athletic meet updates", color: "#d97706" },
      { name: "General", description: "General campus administration circulars", color: "#4b5563" },
    ]);
    console.log(`Seeded ${categories.length} categories.`);

    // Seed Users
    const admin = await User.create({
      name: "Dr. Rajesh Verma",
      email: "admin@college.edu",
      password: "admin123",
      role: "Admin",
      department: "Administration",
    });

    const faculty = await User.create({
      name: "Prof. Priya Nair",
      email: "faculty@college.edu",
      password: "faculty123",
      role: "Faculty",
      department: "Computer Science & Engineering",
    });

    const student = await User.create({
      name: "Akshar Patel",
      email: "student@college.edu",
      password: "student123",
      role: "Student",
      department: "Computer Science & Engineering",
    });

    console.log("Seeded default users (Admin, Faculty, Student).");

    const catExam = categories.find((c) => c.name === "Examination");
    const catPlacement = categories.find((c) => c.name === "Placement");
    const catEvents = categories.find((c) => c.name === "Events");
    const catAcademic = categories.find((c) => c.name === "Academic");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Seed Notices
    await Notice.insertMany([
      {
        title: "Mid-Semester Examination Schedule - October 2026",
        content: "The mid-semester examinations for all B.Tech and MCA semesters will commence from October 25th, 2026. Hall tickets can be collected from the respective department coordinators. Please report 15 minutes before exam commencement.",
        category: catExam._id,
        author: admin._id,
        status: "approved",
        target_audience: "all",
        is_pinned: true,
        expires_at: futureDate,
      },
      {
        title: "Campus Recruitment Drive: TechCorp & CloudSys Solutions",
        content: "TechCorp and CloudSys Solutions will be conducting an on-campus recruitment drive for final year students on November 2nd. Eligibility: Minimum 6.5 CGPA with no active backlogs. Interested candidates must submit their resumes on the placement portal by Friday.",
        category: catPlacement._id,
        author: faculty._id,
        status: "approved",
        target_audience: "students",
        is_pinned: true,
        expires_at: futureDate,
      },
      {
        title: "Annual Tech Fest 2026: InnovateX Hackathon Registrations",
        content: "Registrations are officially open for InnovateX 2026, a 24-hour national-level hackathon. Exciting cash prizes worth ?1,00,000 to be won. Teams of 2 to 4 members can register at the computer lab or via the college portal.",
        category: catEvents._id,
        author: faculty._id,
        status: "approved",
        target_audience: "all",
        is_pinned: false,
        expires_at: futureDate,
      },
      {
        title: "Departmental Research & Curriculum Committee Review",
        content: "All faculty members of the Computer Science Department are requested to submit the revised laboratory manuals and assignment question banks for NAAC compliance by Wednesday 4:00 PM.",
        category: catAcademic._id,
        author: admin._id,
        status: "approved",
        target_audience: "faculty",
        is_pinned: false,
        expires_at: futureDate,
      },
      {
        title: "Guest Lecture on MERN Full Stack and Cloud Deployment",
        content: "A 2-day hands-on workshop on Advanced Web Development using React, Node.js, and MongoDB is proposed for next weekend. Industry speakers from Google and AWS will conduct interactive labs.",
        category: catAcademic._id,
        author: faculty._id,
        status: "pending",
        target_audience: "students",
        is_pinned: false,
        expires_at: futureDate,
      },
      {
        title: "Notice regarding Makeup Laboratory Submissions",
        content: "Students requesting makeup sessions for missed labs must submit written proof to room 204.",
        category: catAcademic._id,
        author: faculty._id,
        status: "rejected",
        rejection_reason: "Needs prior written authorization from Department Dean before publication.",
        target_audience: "students",
        is_pinned: false,
        expires_at: futureDate,
      },
    ]);

    console.log("Seeded sample notices (Pinned, Approved, Pending, Rejected).");
    console.log("\n==========================================");
    console.log("Seed Completed Successfully!");
    console.log("Admin credentials:   admin@college.edu   / admin123");
    console.log("Faculty credentials: faculty@college.edu / faculty123");
    console.log("Student credentials: student@college.edu / student123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedData();
