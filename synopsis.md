# PROJECT SYNOPSIS

**Name / Title of the Project:**
"Online Course Marketplace "

---

## 1. Statement of the Problem

Most existing online learning platforms like Udemy or Coursera are expensive and lack collaborative or intelligent learning features. Students often feel isolated while studying online and have no in-platform help when they get stuck on a concept. Instructors also lack simple tools to publish and monetize their knowledge. There is a need for an affordable, feature-rich platform that supports structured learning, peer collaboration, and AI-assisted understanding — all in one place.

---

## 2. Objective and Scope

**Objectives:**
- Build a marketplace where instructors publish courses and students enroll and study.
- Support video lectures, quizzes, assignments, and progress tracking.
- Provide instructor and learner dashboards with earnings and progress visibility.
- Implement a Virtual Study Room for real-time peer collaboration per course.
- Integrate an AI Study Assistant inside each course using Google Gemini API.
- Handle payments, subscriptions, instructor payouts, and refunds via Stripe.
- Generate certificates on course completion.
- Include admin panel for moderation, user management, and analytics.

**Scope:**
The platform covers the full learning lifecycle — course creation, enrollment, content delivery, assessment, certification, and revenue management. It supports three roles: Admin, Instructor, and Student, with mobile-responsive design for all devices.

---

## 3. Methodology

The project follows an incremental development approach across 5 phases:

**Phase 1 (Day 1–6):** Planning, database schema design, UI/UX wireframes, environment setup.

**Phase 2 (Day 7–18):** Core development — user authentication, role management, course creation and browsing, enrollment, and dashboards using HTML, CSS, JavaScript, Node.js, Express.js, and MySQL.

**Phase 3 (Day 19–30):** Advanced features — video player with notes and speed control, quizzes, assignments, Stripe payments, refund portal, certificate generation, Q&A section, discussion forums, adaptive learning, multilingual support, offline access, and admin analytics.

**Phase 4 (Day 31–36):** Unique features — Virtual Study Room using Socket.io for real-time communication, and AI Study Assistant using Google Gemini API for in-course question answering.

**Phase 5 (Day 37–40):** Testing, bug fixing, performance optimization, and final deployment.

**System Flow:**
```
Visitor → Register/Login → Student or Instructor Role
Student  → Browse → Enroll → Watch Lectures → Quizzes → Study Room → AI Assistant → Certificate
Instructor → Create Course → Upload Content → Publish → View Earnings
Admin → Approve Courses → Manage Users → View Analytics
```

---

## 4. Hardware and Software Requirements

**Hardware:** Intel Core i3 or above, 4 GB RAM, 20 GB storage, broadband internet.

**Software:**

| Category | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Real-time | Socket.io |
| Storage | Cloudinary (free tier) |
| Payments | Stripe + Stripe Connect |
| AI Feature | Google Gemini API (free) |
| Tools | VS Code, Postman, Git, GitHub |

**Limitations:**
- No native mobile app (responsive web only)
- AI Assistant requires internet (external API dependency)
- Video storage limited to Cloudinary free tier quota
- Live video conferencing planned as future work

---

## 5. Future Work

1. Native Android and iOS mobile applications
2. Live class integration with video conferencing
3. Cloud auto-scaling on AWS/GCP with cost monitoring dashboard
4. Blockchain-based tamper-proof certificates
5. Gamification — badges, streaks, and leaderboards

---

## 6. Schedule of the Project

Total Duration: 40 Days

| Phase | Activity | Duration |
|-------|----------|----------|
| Phase 1 | Planning, design, database schema | Day 1 – Day 6 |
| Phase 2 | Core frontend and backend development | Day 7 – Day 18 |
| Phase 3 | Advanced features (payments, quizzes, certificates) | Day 19 – Day 30 |
| Phase 4 | Virtual Study Room and AI Study Assistant | Day 31 – Day 36 |
| Phase 5 | Testing, optimization, deployment | Day 37 – Day 40 |

---

## 7. Conclusion

The Online Course Marketplace is a full-stack web application that solves real gaps in online learning — affordability, collaboration, and intelligent in-course support. The two unique additions, Virtual Study Room and AI Study Assistant, make it stand out from existing platforms. Built with industry-standard technologies (Node.js, MySQL, Socket.io, Stripe, Gemini API), the project demonstrates practical full-stack and cloud development skills while delivering genuine value to students and instructors.

---

## 8. References

[1] Node.js Documentation. Available: https://nodejs.org/en/docs

[2] MySQL Documentation, Oracle. Available: https://dev.mysql.com/doc/

[3] Stripe Developer Docs. Available: https://stripe.com/docs

[4] Socket.io Documentation. Available: https://socket.io/docs/v4/

[5] Google Gemini API Docs. Available: https://ai.google.dev/docs

[6] Cloudinary Documentation. Available: https://cloudinary.com/documentation

[7] MDN Web Docs — HTML, CSS, JavaScript. Available: https://developer.mozilla.org

[8] R. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," Doctoral dissertation, UC Irvine, 2000.


