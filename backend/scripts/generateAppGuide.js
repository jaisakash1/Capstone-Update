const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50, size: 'A4' });
const out = path.join(__dirname, '..', 'DiabetCare_App_Guide.pdf');
doc.pipe(fs.createWriteStream(out));

const C = { h1: '#1a365d', h2: '#2d3748', body: '#374151', muted: '#6b7280', line: '#d1d5db', blue: '#2563eb' };

const h1 = (t) => { doc.moveDown(0.3); doc.fontSize(20).fillColor(C.h1).text(t); doc.strokeColor(C.line).lineWidth(1).moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).stroke(); doc.moveDown(0.6); };
const h2 = (t) => { doc.moveDown(0.2); doc.fontSize(13).fillColor(C.h2).text(t); doc.moveDown(0.2); };
const p = (t) => doc.fontSize(10.5).fillColor(C.body).text(t, { lineGap: 2 });
const b = (t) => doc.fontSize(10.5).fillColor(C.body).text(`  •  ${t}`, { lineGap: 1.5 });
const gap = () => doc.moveDown(0.4);

// ===== COVER =====
doc.moveDown(8);
doc.fontSize(36).fillColor(C.h1).text('DiabetCare', { align: 'center' });
doc.fontSize(14).fillColor(C.muted).text('Diabetes Patient Follow-up System', { align: 'center' });
doc.moveDown(0.5);
doc.fontSize(12).fillColor(C.muted).text('Application Features & Developer Guide', { align: 'center' });
doc.moveDown(4);
doc.fontSize(10).fillColor(C.muted).text('MERN Stack  |  Docker  |  JWT Auth  |  Recharts  |  PDFKit', { align: 'center' });
doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

// ===== TECH STACK =====
doc.addPage();
h1('Tech Stack');
p('Frontend: React 19, React Router v7, Axios, Recharts, Vite, Vanilla CSS');
p('Backend: Node.js, Express, MongoDB/Mongoose, JWT, bcryptjs, PDFKit, Nodemailer');
p('Infra: Docker Compose (3 containers — frontend/nginx, backend/node, mongodb)');

gap();
h1('Architecture');
p('Two-role JWT auth system: "hospital" and "patient" roles.');
p('Hospital staff manage all data. Patients can only view their own records.');
p('Credentials are auto-generated on patient registration (prefix + counter for ID, random 5-digit PIN).');
p('Backend routes: /api/auth, /api/patients, /api/readmissions, /api/followups, /api/reports, /api/portal, /api/hospital');

// ===== HOSPITAL FEATURES =====
gap();
h1('Hospital Portal Features');

h2('1. Dashboard  (/)');
b('6 stat cards: Total Patients, Visited This Month, Pending Labs, Abnormal A1C, Readmissions This Month, Pending Follow-ups');
b('Critical Patients section — auto-flags abnormal HbA1c patients + overdue follow-ups');
b('4 charts (Recharts): HbA1c distribution pie, Monthly admissions bar, Gender pie, Age bar');
b('Quick action links to key pages');

gap();
h2('2. All Patients  (/patients)');
b('Searchable, filterable patient list with columns: Name, ID, Gender, Age, HbA1c, Glucose, Med');
b('Actions per row: Edit, View Credentials, Download Report PDF, Delete');

gap();
h2('3. New Patient  (/new-patient)');
b('Registration form: Name, Age, Gender, Phone, Email (optional), Hospital days, Visits, Lab results, Medication');
b('Auto-generates Patient ID (e.g. DIABETCARE-00001) and 5-digit PIN');
b('If email provided → sends admission email with credentials via Nodemailer');

gap();
h2('4. Patient Detail  (/patients/:id)');
b('4-tab editing interface: Info | Vitals & Labs | Diseases | Symptoms');
b('All changes save to DB and are immediately visible to the patient');
b('View Credentials modal with Copy and Reset Password buttons');
b('Timestamps: sets lastUpdatedByHospital on every mutation (used for patient notifications)');

gap();
h2('5. Password Reset');
b('Inside credentials modal → "Reset Password" generates new 5-digit PIN');
b('Old password invalidated immediately, new one emailed if patient has email on file');
b('Backend: POST /api/patients/:id/reset-password');

gap();
h2('6. Readmissions  (/readmission)');
b('CRUD for readmission records: patient, date, reason, notes');
b('Counts reflected in dashboard stats');

gap();
h2('7. Follow-ups  (/followup)');
b('Schedule follow-ups: patient, type, date, recommended tests, result');
b('Mark as completed. Overdue ones appear in Critical Patients dashboard section');

gap();
h2('8. Reports  (/reports)');
b('Summary stats page. Individual patient PDF reports via "All Patients" download icon');
b('PDFs generated server-side with PDFKit');

gap();
h2('9. Nearby Hospitals  (/hospitals)');
b('Location-based hospital finder for referrals');

gap();
h2('10. Hospital Settings  (/settings)');
b('Edit: Name, Patient ID Prefix, Address, Phone, Emergency Contact, Email');
b('Changes reflect in patient portal, emails, and PDF reports');
b('Backend: GET/PUT /api/hospital');

gap();
h2('11. Dark/Light Mode');
b('Toggle button in sidebar footer (both portals)');
b('CSS variables swap via [data-theme="light"] selector. Persisted in localStorage');

// ===== PATIENT FEATURES =====
doc.addPage();
h1('Patient Portal Features');

h2('12. Patient Dashboard  (/)');
b('Welcome header with name, ID, enrollment status');
b('Notification banner — appears when hospital updates records (compares lastUpdatedByHospital vs lastViewedByPatient)');
b('"Download Report" button — generates and downloads patient PDF');
b('Vital cards: BP, Sugar Level, HbA1c status, Glucose status');
b('Overview cards: Pending/Completed reports, Readmissions, Medication');
b('Next appointment display and hospital contact info section');

gap();
h2('13. Reports  (/reports)');
b('Completed follow-up reports, sorted by date');

gap();
h2('14. Pending Reports  (/pending)');
b('Upcoming/incomplete follow-ups, sorted by scheduled date');

gap();
h2('15. Conditions  (/diseases)');
b('View diagnosed diseases: name, status (Active/Managed/Resolved), date, notes. Read-only for patients');

gap();
h2('16. Symptoms  (/symptoms)');
b('View symptoms: name, severity (Mild/Moderate/Severe), date. Read-only for patients');

gap();
h2('17. Appointments  (/appointments)');
b('All follow-up appointments with type, date, result, completion status');

gap();
h2('18. Download Report (PDF)');
b('Patient clicks "Download Report" → frontend fetches /api/portal/download-report with JWT');
b('Backend generates PDF with PDFKit containing: personal info, vitals, diseases, symptoms, readmissions, follow-ups');

// ===== KEY BACKEND ROUTES =====
gap();
h1('Key API Routes');
p('POST /api/auth/login — Login (hospital or patient)');
p('GET  /api/auth/me — Validate token, return user');
p('GET  /api/patients — List all patients');
p('POST /api/patients — Create patient (auto-generates credentials)');
p('PUT  /api/patients/:id — Update patient (sets lastUpdatedByHospital)');
p('GET  /api/patients/:id/credentials — View login credentials');
p('POST /api/patients/:id/reset-password — Reset patient password');
p('GET  /api/patients/stats/dashboard — Dashboard stat counts');
p('GET  /api/patients/stats/critical — Abnormal patients + overdue follow-ups');
p('GET  /api/reports/charts — Aggregated chart data (5 datasets)');
p('GET  /api/portal/dashboard — Patient dashboard data + notification flag');
p('GET  /api/portal/download-report — Generate patient PDF');
p('GET  /api/hospital — Hospital profile');
p('PUT  /api/hospital — Update hospital profile');

// ===== KEY MODELS =====
gap();
h1('Data Models');
h2('Patient');
p('Fields: patientId, password, plainPassword, name, age, gender, phone, email, hospital (ref), timeInHospital, emergencyVisits, inpatientVisits, hba1c, glucose, diabetesMed, bloodPressure {systolic, diastolic}, sugarLevel, diseases [], symptoms [], isEligible, lastUpdatedByHospital, lastViewedByPatient');

gap();
h2('Hospital');
p('Fields: hospitalId, password, name, address, phone, emergencyContact, email, prefix, patientCounter');

gap();
h2('FollowUp');
p('Fields: patient (ref), type, scheduledDate, completedDate, result, isCompleted, recommendedTests []');

gap();
h2('Readmission');
p('Fields: patient (ref), readmissionDate, reason, notes');

// ===== ENV VARS =====
gap();
h1('Environment Variables');
p('MONGO_URI — MongoDB connection string');
p('JWT_SECRET — Secret for signing JWT tokens');
p('PORT — Backend port (default: 5000)');
p('SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — Nodemailer config (optional)');

// ===== STARTUP =====
gap();
h1('Quick Start');
p('1. docker-compose up --build -d');
p('2. Open http://localhost:5173');
p('3. Login: HOSP001 / admin123');
p('4. Patient accounts are auto-created via New Patient registration');

doc.end();
doc.on('end', () => console.log('PDF saved to: ' + out));
