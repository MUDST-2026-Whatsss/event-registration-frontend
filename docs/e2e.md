# คู่มือ E2E Frontend

คงขั้นตอนทดสอบของ GitHub เป็นหลักและรวมเฉพาะส่วนที่ยังขาดไว้ใน branch feat/registration-check-in
เปลี่ยนหัวข้อเคสให้เป็น snake_case และชื่อฟังก์ชันตรงกัน โดยใช้โครงสร้าง cypress/e2e และ cypress/support เดิม

## คำสั่ง

พิมพ์จากโฟลเดอร์ event-registration-frontend หลัง npm ci

```powershell
npm run test:e2e
npm run login
npm run login_failed
npm run register
npm run profile_update
npm run e2e:list
npm run e2e -- registration_consent_required
npm run e2e:open -- login
```

ชื่อหลักอย่าง login หรือ register เลือกทั้งกลุ่ม ส่วน login_failed เลือกเคสเดียว
คำสั่งกลาง npm run e2e -- ชื่อกลุ่มหรือชื่อเคส อ่านชื่อจากไฟล์อัตโนมัติ
ชื่อไม่ถูกต้อง ไม่มี test หรือมี test ไม่ผ่านจะคืนสถานะล้มเหลว
case ID เดียวอาจอยู่ในกลุ่มไฟล์และกลุ่มฟังก์ชันได้ แต่ full suite รันเคสจริงครั้งเดียว

## การเตรียมระบบและขอบเขต

Frontend เปิด Vite สำหรับทดสอบบนพอร์ตว่างและปิดเมื่อจบเอง ไม่ต้องเปิด Docker หรือ npm run dev
คำสั่ง npm run test:e2e:run ใช้ Vite ที่เปิดเองตาม CYPRESS_BASE_URL ได้เช่นเดิม
ชุดนี้เปิด browser จริง แต่จำลอง API ด้วย cypress/support จึงไม่ยืนยัน browser → API → database ทั้งเส้นทาง

การชำระเงินเป็น QR จำลองตามขอบเขตโครงงาน ไม่มีการเก็บเงินจริง
เคสใหม่เตรียมข้อมูลเองหรือผ่าน beforeEach เพื่อให้เลือกมารันเดี่ยวได้

## รายการเคสใน branch นี้

| ไฟล์ใต้ cypress/e2e | ชื่อเคส |
| --- | --- |
| `access-control.cy.js` | `role_create_assign`, `user_disable_enable`, `access_super_admin_denied` |
| `access_control.cy.js` | `access_admin_denied`, `access_reviewer_denied` |
| `account.cy.js` | `register`, `register_errors`, `forgot_password`, `reset_password`, `select_role` |
| `admin.cy.js` | `admin_login_required`, `admin_dashboard` |
| `analytics.cy.js` | `analytics_show_rate`, `analytics_empty`, `analytics_failed` |
| `auth.cy.js` | `login_session_recovery`, `login_required`, `login_failed`, `login` |
| `change_password.cy.js` | `change_password`, `change_password_failed`, `change_password_mismatch`, `change_password_cancel` |
| `check-in.cy.js` | `check_in_qr`, `analytics_attendance`, `offline_check_in`, `check_in`, `check_in_failed` |
| `console.cy.js` | `admin_participants`, `super_admin_dashboard`, `super_admin_participants`, `audit_logs` |
| `event.cy.js` | `event_draft_empty`, `event_submit_incomplete`, `event_draft_failed`, `event_change_missing_reason` |
| `events.cy.js` | `events_no_results`, `events_failed`, `events_not_found`, `events_full` |
| `forgot_password.cy.js` | `forgot_password_empty`, `forgot_password_failed` |
| `governance.cy.js` | `event_approve`, `event_change_approve`, `event_change_reject`, `event_save_conflict`, `event_reject`, `event_approve_failed` |
| `guest-registration.cy.js` | `guest_registration`, `guest_ticket_lookup`, `guest_payment_login` |
| `live-seats.cy.js` | `live_seats`, `live_seats_hidden` |
| `login.cy.js` | `login_empty`, `login_invalid_email`, `login_short_password`, `login_locked`, `login_server_error`, `login_redirect`, `login_role_redirect` |
| `navigation.cy.js` | `events_home`, `events_list`, `events_search`, `events_detail`, `events_cover_placeholder`, `events_filter_reload`, `events_closed_not_promoted` |
| `offline_check_in.cy.js` | `offline_check_in_retry`, `offline_check_in_rejected` |
| `profile.cy.js` | `profile`, `profile_update`, `profile_update_failed`, `profile_avatar_invalid` |
| `register.cy.js` | `register_empty`, `register_invalid_phone`, `register_weak_password`, `register_field_error` |
| `registration.cy.js` | `guest_registration_back`, `registration_cancel`, `registration_no_show`, `registration`, `registration_payment`, `registration_consent_required`, `registration_full`, `registration_payment_failed` |
| `reset_password.cy.js` | `reset_password_missing_token`, `reset_password_mismatch`, `reset_password_weak` |
| `select_role.cy.js` | `select_role_failed`, `select_role_logout` |

## การรวมกับงานในเครื่องเดิม

เพิ่มเคสที่ยังขาด 41 เคส โดยไม่นำเคสเดิมในเครื่อง 34 เคสที่ซ้ำหรือหมดความจำเป็นมารันซ้ำ
สำหรับเส้นทางที่ซ้ำกันแต่มีจุดตรวจย่อยเพิ่มเติม จะเพิ่ม assertion เข้าเคสของ GitHub แทน
ฝั่งเว็บตัด events_guest_register เดิมที่บังคับ guest ไป login เพราะ Phase 2 อนุญาต guest สมัครกิจกรรมฟรีแล้ว

ใช้ cypress/support/scenarios.js ลงทะเบียนเฉพาะเคสที่เลือก และ scripts/cypress-runner.js สำหรับคำสั่ง
เพิ่มเคสด้วย scenario('ชื่อเคส', function ชื่อเคส() { ... }) ชื่อห้ามซ้ำ
เพิ่มคำสั่งสั้นใน package.json เมื่อต้องการ npm run ชื่อเคส โดยคำสั่งกลางค้นพบเคสใหม่ได้เอง
