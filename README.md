# Eventsss Frontend

Vue 3 / Vite frontend for public event discovery, participant registration, event administration,
and system governance.

## Current scope

Connected to the Spring Boot API:

- Register, login, refresh, logout, and authentication initialization
- Cookie/CSRF request handling
- Participant profile text fields and password change
- Role-aware navigation for USER, ADMIN, and SUPER_ADMIN
- Published event catalogue, event search/filtering, and event detail
- Admin event lifecycle and Super Admin governance/access-control screens

Also connected to the API:

- Event registration, cancellation, seat availability, and participant lists
- Event invitations, partial drafts, and recent registration activity
- Password recovery with an emailed reset token
- Audit, sign-in, and session activity with spreadsheet export

Profile avatars remain in per-user `localStorage`. QR tickets display the saved registration
number; attendance scanning/check-in is outside the current classroom scope.

The QR payment flow is an intentional university demonstration. The backend saves the simulated
confirmation when `MOCK_PAYMENTS_ENABLED=true`; no real money is collected. A payment provider is
not required for this project.

## ฟีเจอร์หลัก

- แสดงรายการและรายละเอียดกิจกรรมที่เผยแพร่แล้ว ค้นหาและกรองรายการในหน้าเว็บ พร้อมแสดงจำนวนที่นั่งคงเหลือ
- สมัครสมาชิก เข้าสู่ระบบ เลือก Role ที่บัญชีได้รับ ลืม/ตั้งรหัสผ่านใหม่ และจัดการโปรไฟล์
- ลงทะเบียนกิจกรรม ดูรายการของตนเองและคำเชิญ ยกเลิกตามนโยบายกิจกรรม และแสดง QR ticket ที่สร้างในเบราว์เซอร์
- Admin สร้าง/แก้ไขฉบับร่าง ส่งตรวจ ติดตามกิจกรรมและผู้เข้าร่วม รวมถึงเชิญผู้เข้าร่วม
- Super Admin จัดคิวอนุมัติกิจกรรมและคำขอเปลี่ยนแปลง จัดการผู้ดูแลกิจกรรม บัญชี Role และ Permission
- แสดง audit log, ประวัติการเข้าสู่ระบบและ session พร้อมส่งออก Excel
- อัปโหลดภาพกิจกรรมไปยัง MinIO และให้ API ส่งภาพผ่าน public media endpoint

## ความสามารถแยกตาม Role

### User (ผู้เข้าร่วม)

- ดูหน้าแรก แคตตาล็อกและรายละเอียดกิจกรรมที่เผยแพร่แล้ว
- สมัครบัญชี เข้าสู่ระบบ และแก้ไขข้อมูลโปรไฟล์/รหัสผ่าน
- ลงทะเบียนกิจกรรมที่เผยแพร่และยังมีที่นั่ง ดูการลงทะเบียนและคำเชิญของตนเอง
- ยกเลิกการลงทะเบียนได้เมื่อยังอยู่ในช่วงที่กิจกรรมอนุญาต
- ดู QR ticket ที่สร้างบนฝั่งเว็บสำหรับรายการลงทะเบียน

### Admin

- ดู Dashboard และรายการกิจกรรมภายในขอบเขตที่ได้รับมอบหมาย
- บันทึกฉบับร่าง แก้ไขฉบับร่างหรือกิจกรรมที่ถูกปฏิเสธ ส่งตรวจ ถอนคำขอตรวจ ยกเลิกกิจกรรม และลบฉบับร่าง/รายการที่ถูกปฏิเสธตามเงื่อนไข
- อัปโหลดภาพ ค้นหาผู้ใช้ที่มีบัญชีเพื่อเชิญเข้าร่วม และดูรายชื่อผู้ลงทะเบียน
- สำหรับกิจกรรมที่เผยแพร่แล้ว เสนอการเปลี่ยนแปลงผ่าน change request ซึ่งจะยังไม่กระทบข้อมูลที่เผยแพร่จนกว่า Super Admin อนุมัติ

### Super Admin

- ดูภาพรวมส่วนกลาง รายการกิจกรรมและรายชื่อผู้เข้าร่วม
- อนุมัติหรือปฏิเสธกิจกรรมที่ส่งตรวจ และอนุมัติหรือปฏิเสธ change request พร้อมเหตุผลเมื่อปฏิเสธ
- มอบหมาย Admin ให้กิจกรรม (โดยคงเจ้าของกิจกรรมไว้)
- ค้นหา/ดูบัญชี ระงับหรือเปิดใช้งานบัญชี และกำหนดชุด Role ให้บัญชี
- สร้าง แก้ไข ลบ Role แบบกำหนดเอง และกำหนด Permission ตามข้อจำกัดของ Role ระบบ
- ตรวจสอบ audit log, sign-in attempts และ session พร้อมกรองและส่งออก Excel

## User Stories

### User

1. **U-01 — สมัครและเข้าถึงบัญชี:** ในฐานะผู้ใช้ ฉันต้องการสมัคร เข้าสู่ระบบ และออกจากระบบ เพื่อเข้าถึงความสามารถตามสิทธิ์ของฉัน
2. **U-02 — กู้คืนบัญชี:** ในฐานะผู้ใช้ ฉันต้องการขอลิงก์ตั้งรหัสผ่านใหม่และกำหนดรหัสผ่านใหม่ เพื่อกลับเข้าใช้งานเมื่อจำรหัสผ่านไม่ได้
3. **U-03 — จัดการโปรไฟล์:** ในฐานะผู้ใช้ ฉันต้องการดูและแก้ไขข้อมูลโปรไฟล์และเปลี่ยนรหัสผ่าน เพื่อรักษาข้อมูลบัญชีให้เป็นปัจจุบัน
4. **U-04 — ค้นหากิจกรรม:** ในฐานะผู้ใช้ ฉันต้องการดู ค้นหาและกรองกิจกรรมที่เผยแพร่ พร้อมรายละเอียด ช่วงเวลา สถานที่และที่นั่งคงเหลือ เพื่อเลือกกิจกรรมที่เหมาะสม
5. **U-05 — ลงทะเบียนกิจกรรม:** ในฐานะผู้ใช้ที่เข้าสู่ระบบ ฉันต้องการลงทะเบียนกิจกรรมที่เผยแพร่และมีที่นั่ง เพื่อสำรองสิทธิ์เข้าร่วม โดยระบบต้องป้องกันการลงทะเบียนเกินความจุ
6. **U-06 — ดูการลงทะเบียนและคำเชิญ:** ในฐานะผู้ใช้ ฉันต้องการดูรายการลงทะเบียนและคำเชิญของตนเอง เพื่อจัดการการเข้าร่วม
7. **U-07 — ใช้ QR ticket:** ในฐานะผู้ลงทะเบียน ฉันต้องการดู QR ticket ของรายการ เพื่อใช้แสดงข้อมูลการลงทะเบียน (ระบบสร้าง QR ในเบราว์เซอร์)
8. **U-08 — ยกเลิกการลงทะเบียน:** ในฐานะผู้ลงทะเบียน ฉันต้องการยกเลิกรายการภายในเงื่อนไขเวลาของกิจกรรม เพื่อคืนที่นั่งเมื่อไม่สามารถเข้าร่วมได้
9. **U-09 — ลงทะเบียนกิจกรรมในฐานะ Guest:** ในฐานะ Guest ฉันต้องการลงทะเบียนเข้าร่วมกิจกรรมโดยไม่ต้องสมัครสมาชิก เพื่อให้สามารถเข้าร่วมกิจกรรมได้โดยไม่จำเป็นต้องสร้างบัญชีก่อน
10. **U-10 — เชื่อมโยงประวัติการลงทะเบียนของ Guest:** ในฐานะผู้ใช้ที่เพิ่งสมัครสมาชิก ฉันต้องการให้ระบบเชื่อมโยงข้อมูลการลงทะเบียนที่เคยทำในฐานะ Guest เข้ากับบัญชีของฉัน เพื่อให้สามารถดูประวัติการลงทะเบียนเดิมได้

### Admin

1. **A-01 — ดูภาพรวม:** ในฐานะ Admin ฉันต้องการดูสถิติกิจกรรมและการลงทะเบียนล่าสุดในขอบเขตของฉัน เพื่อวางแผนการจัดงาน
2. **A-02 — จัดการฉบับร่าง:** ในฐานะ Admin ฉันต้องการสร้าง บันทึก แก้ไข และลบฉบับร่าง เพื่อเตรียมรายละเอียดกิจกรรมก่อนเผยแพร่
3. **A-03 — ส่งกิจกรรมตรวจ:** ในฐานะ Admin ฉันต้องการส่งกิจกรรมเข้าคิวตรวจและถอนการส่งได้ เพื่อควบคุมเวลาการขออนุมัติ
4. **A-04 — ติดตามผลตรวจ:** ในฐานะ Admin ฉันต้องการดูสถานะกิจกรรมและเหตุผลการปฏิเสธ เพื่อแก้ไขและส่งตรวจใหม่
5. **A-05 — ดูแลกิจกรรมที่เผยแพร่:** ในฐานะ Admin ฉันต้องการยกเลิกกิจกรรมของฉัน เพื่อแจ้งการยกเลิกและยกเลิกการลงทะเบียนที่ยัง active ทั้งหมด
6. **A-06 — ขอเปลี่ยนข้อมูลที่เผยแพร่:** ในฐานะ Admin ฉันต้องการส่งคำขอเปลี่ยนข้อมูลกิจกรรมที่เผยแพร่ เพื่อให้ Super Admin ตรวจสอบก่อนข้อมูลใหม่มีผล
7. **A-07 — จัดการผู้เข้าร่วม:** ในฐานะ Admin ฉันต้องการค้นหาผู้ใช้ที่มีบัญชีเพื่อเชิญ และดูรายชื่อผู้ลงทะเบียนของกิจกรรมในขอบเขต เพื่อประสานงาน
8. **A-08 — จัดการภาพกิจกรรม:** ในฐานะ Admin ฉันต้องการอัปโหลดและลบภาพของกิจกรรมที่ดูแล เพื่อแสดงสื่อประกอบในหน้ารายละเอียด
9. **A-10 — เช็กชื่อผู้เข้าร่วมด้วย QR Code:** ในฐานะ Admin ฉันต้องการสแกน QR Code ของผู้ลงทะเบียนเพื่อตรวจสอบสิทธิ์และบันทึกสถานะการเข้าร่วมกิจกรรม เพื่อให้สามารถจัดการการเช็กชื่อได้สะดวก
10. **A-11 — ตรวจสอบสถานะการเช็กชื่อ:** ในฐานะ Admin ฉันต้องการดูรายชื่อผู้ลงทะเบียนพร้อมสถานะการเช็กชื่อ เพื่อให้สามารถตรวจสอบจำนวนผู้เข้าร่วมจริงได้
11. **A-13 — เช็กชื่อแบบออฟไลน์:** ในฐานะ Admin ฉันต้องการสแกน QR Code และบันทึกข้อมูลการเช็กชื่อได้แม้ไม่มีอินเทอร์เน็ต เพื่อให้สามารถดำเนินการเช็กชื่อได้อย่างต่อเนื่อง
12. **A-14 — ซิงก์ข้อมูลการเช็กชื่อ:** ในฐานะ Admin ฉันต้องการให้ระบบซิงก์ข้อมูลการเช็กชื่อที่บันทึกไว้ขณะออฟไลน์โดยอัตโนมัติเมื่อกลับมาเชื่อมต่ออินเทอร์เน็ต เพื่อให้ข้อมูลการเข้าร่วมในระบบเป็นปัจจุบัน

### Super Admin

1. **S-01 — ดูภาพรวมส่วนกลาง:** ในฐานะ Super Admin ฉันต้องการดูจำนวนบัญชี คิวตรวจและกิจกรรมล่าสุด เพื่อเฝ้าติดตามระบบ
2. **S-02 — ตรวจสอบและตัดสินกิจกรรม:** ในฐานะ Super Admin ฉันต้องการดูรายละเอียดและอนุมัติหรือปฏิเสธกิจกรรม เพื่อควบคุมการเผยแพร่
3. **S-03 — ตรวจสอบคำขอเปลี่ยนแปลง:** ในฐานะ Super Admin ฉันต้องการเปรียบเทียบข้อมูลเดิมกับข้อมูลที่เสนอ และอนุมัติหรือปฏิเสธพร้อมเหตุผล เพื่อรักษาความถูกต้องของกิจกรรมที่เผยแพร่
4. **S-04 — มอบหมายผู้ดูแล:** ในฐานะ Super Admin ฉันต้องการดูรายชื่อ Admin และกำหนดผู้ดูแลให้กิจกรรม เพื่อแบ่งหน้าที่จัดการ
5. **S-05 — ดูแลบัญชีผู้ใช้:** ในฐานะ Super Admin ฉันต้องการค้นหาและดูบัญชี สถิติ เปลี่ยนสถานะ และกำหนด Role เพื่อดูแลสิทธิ์การใช้งาน
6. **S-06 — ดูแล Role และ Permission:** ในฐานะ Super Admin ฉันต้องการดู Permission สร้าง/แก้ไข/ลบ Role และกำหนด Permission เพื่อปรับการเข้าถึงตามหน้าที่
7. **S-07 — ตรวจสอบประวัติระบบ:** ในฐานะ Super Admin ฉันต้องการค้นหา audit log, ประวัติ sign-in และ session รวมถึงส่งออก Excel เพื่อใช้ตรวจสอบเหตุการณ์
8. **S-08 — ดูรายชื่อผู้เข้าร่วม:** ในฐานะ Super Admin ฉันต้องการดูรายชื่อผู้ลงทะเบียนของกิจกรรม เพื่อช่วยตรวจสอบข้อมูลกิจกรรมส่วนกลาง

**รวม 30 User Stories:** User 10, Admin 12 และ Super Admin 8

## กฎทางธุรกิจและ Workflow

- หน้าเว็บมี route guard เพื่อจัดการการนำทาง แต่ API เป็นผู้บังคับใช้ Authentication, Permission และขอบเขตเจ้าของกิจกรรมทุกคำขอ
- สถานะกิจกรรมในโค้ด ได้แก่ `DRAFT`, `PENDING_REVIEW`, `PUBLISHED`, `REJECTED`, `CANCELLED` และ `COMPLETED`; ไม่พบสถานะ `Upcoming`, “เปิดรับ” หรือ “เต็ม” เป็นสถานะถาวร กำหนดการและจำนวนที่นั่งใช้แสดงความพร้อมในหน้ารายละเอียด
- Workflow หลัก: Admin สร้าง `DRAFT` → ส่งตรวจเป็น `PENDING_REVIEW` → Super Admin อนุมัติเป็น `PUBLISHED` หรือปฏิเสธเป็น `REJECTED`; Admin แก้ไขแล้วส่งตรวจใหม่ได้
- กิจกรรมที่เผยแพร่แล้วแก้ตรงไม่ได้ การแก้ไขต้องส่ง change request และข้อมูลใหม่มีผลหลัง Super Admin อนุมัติเท่านั้น
- การลงทะเบียนที่ใช้ความจุคือ `PENDING_PAYMENT`, `CONFIRMED`, `CHECKED_IN`; API ตรวจความจุภายใต้ row lock และมี seat reservation ที่หมดอายุได้
- กิจกรรมฟรีลงทะเบียนเป็น `CONFIRMED`; กิจกรรม `PAID` ใช้การจำลองชำระเงินในโหมดที่เปิดไว้เท่านั้น ไม่มี Payment provider จริง
- การยกเลิกการลงทะเบียนอยู่ภายใต้นโยบายและช่วงเวลาที่กำหนดของกิจกรรม ส่วนการยกเลิกกิจกรรมทำให้รายการลงทะเบียน active ถูกยกเลิกด้วย
- การปิดใช้งานบัญชีหรือเปลี่ยน Role/Permission ที่เกี่ยวข้องอาจเพิกถอน session เพื่อให้สิทธิ์ใหม่มีผล

## Requirements

- Node.js `22.22.2+`, `24.15.0+`, or `26+` for the locked test dependencies
- npm

## Setup

Clone the `develop` branch to get the latest application and browser tests used by backend CI:

```bash
git clone --branch develop https://github.com/MUDST-2026-Whatsss/event-registration-frontend.git
cd event-registration-frontend
npm ci
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` for the copy step.

Vite runs at `http://localhost:5173`. Browser requests remain same-origin under `/api`; the local
development proxy forwards them to `VITE_API_PROXY_TARGET`, defaulting to
`http://localhost:8080`.

If Docker already occupies port 5173, Vite selects the next available port, usually 5174. Open the
URL printed by Vite. The backend's local CORS settings must include that exact origin, including
whether the host is `localhost` or `127.0.0.1`. The backend `.env.example` includes both hosts on
ports 5173 and 5174. Existing backend `.env` files need the same update; recreate the API container
with `docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --no-deps api`
from the backend directory to apply it to a source build.

## Commands

```bash
npm run dev
npm test
npm run build
npm run preview
npm run test:e2e
npm run test:e2e:open
```

Cypress tests intercept the API with isolated fixtures; they do not log into the shared database.
The suite covers navigation, authentication, free registration, the QR payment demonstration,
cancellation, event submission/approval, published-event change approval/rejection, and user/role
administration. Controls use `data-test` attributes and `cy.getByTestId`, following Lab Week 7.
These browser tests complement the backend's PostgreSQL integration tests; they do not replace them.

To run one browser spec:

```bash
npx start-server-and-test dev http://127.0.0.1:5173 "node scripts/cypress-runner.js --spec cypress/e2e/governance.cy.js"
```

## Docker

Backend CI produces the release artifact and application images. Before using the release
commands below, confirm that Backend CI completed successfully and all three GHCR application
packages are public. A local source build does not publish a release.

The production image serves the built Vite application with Nginx and proxies same-origin `/api`
requests to the Compose service named `api`. Its health check verifies both the HTML application
and the API through that proxy.

Use the backend release artifact for the complete stack. Extract its `docker-compose.yml` and
generated `.env` into the same directory, then run there:

```bash
docker compose up -d
```

Compose pulls the published frontend, backend, MinIO, and PostgreSQL images. This delivery needs
Docker Compose and the two release files; see the backend README for release download and first
account setup. Keep the generated `.env` private.

To build from source instead, clone this repository beside the backend repository, prepare the
backend `.env` as described in its README, and run from the backend directory:

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml up -d --build
```

Open `http://localhost:5173`. Set `FRONTEND_PORT` in the backend environment file when another host
port is required. Backend CI tests a specific frontend commit, publishes its Docker image, and
uses that same revision for the complete delivery. Frontend CI runs the frontend tests and build.

`npm run dev` provides Vite hot reload while editing frontend code. Start the complete Docker stack
from the backend or release directory; there is no separate frontend-only Compose stack.

## Structure

| Directory | Responsibility |
| --- | --- |
| `src/app/` | Application shell, global navigation UI, and root router composition |
| `src/features/auth/` | Authentication, profile, auth pages, and feature routes |
| `src/features/events/` | Public event catalogue/detail, event components, and event data/API boundary |
| `src/features/registrations/` | Registration flow, tickets, and participant registrations |
| `src/features/console-shell/` | Shared admin/super-admin layout and navigation chrome |
| `src/features/dashboards/` | Admin and super-admin dashboard screens |
| `src/features/governance/` | Approvals, change requests, and audit logs |
| `src/features/access-control/` | User and role administration |
| `src/shared/ui/` | Domain-agnostic UI used by more than one feature |
| `src/shared/composables/` | Cross-feature browser/application behavior |
| `src/shared/lib/` | API transport, cookie credentials, CSRF, and generic errors |

Small feature slices colocate their files directly. Larger features may add `components/`, `pages/`,
`api/`, or `composables/` only when needed. Cross-feature imports use a public entry point or exported
route records instead of reaching into implementation folders.

## Documentation

- [`docs/architecture.md`](docs/architecture.md): frontend structure and state boundaries
- [`docs/api-integration.md`](docs/api-integration.md): API, cookie, CSRF, and error conventions
- [`docs/pages-and-flows.md`](docs/pages-and-flows.md): page inventory and live/mock status
- The course Labs in the Docs folder define the coursework; this repository follows the existing feature architecture.

## Security

- Do not store auth tokens in localStorage or JavaScript-readable cookies.
- Do not treat Vue route guards as authorization; the API must enforce access.
- Do not commit `.env`, `node_modules`, `dist`, personal data, or provider credentials.
- Never mark a payment successful from a frontend timer or browser-supplied value.
