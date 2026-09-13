# SiviHack 2026 — Team Playbook

## 1. Team & điểm mạnh

Hackathon 24h: mỗi người phải tự đi hết một flow/feature end-to-end (UI → API → logic → kết quả).
Chia việc theo **flow**, không chia theo **layer** — chia theo layer tạo blocking point.

| Thành viên | Điểm mạnh |
|---|---|
| Mạnh Hùng | AI / Data / Quant — định nghĩa bài toán, ML & quantitative logic, evaluation, KPI |
| Anh Tuấn | Backend — API, database, integration, deployment, reliability |
| Thiên Ân | Frontend — UI/UX, product flow, dashboard, visualization, demo experience |
| Thành An | Automation & QA — n8n, webhook, external API, testing, README & submission |

> Điểm mạnh = người được hỏi khi bí và người review phần đó, **không** phải người duy nhất được đụng vào.

---

## 2. Nguyên tắc

1. Problem trước Technology.
2. Một user chính + một pain point chính + một workflow chính.
3. Build vertical slice càng sớm càng tốt; không đợi cuối mới integration.
4. Không thêm complexity nếu không tạo ra value rõ ràng.
5. AI output phải kiểm tra được hoặc giải thích được.
6. Demo ổn định quan trọng hơn thêm feature.
7. Feature freeze trước submission.
8. Không đổi stack giữa cuộc thi, trừ khi Challenge bắt buộc hoặc stack hiện tại không giải được bài toán.

---

## 3. Tech stack chính

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React + Vite | SPA, không Streamlit |
| Backend | Python + FastAPI | Nơi duy nhất chứa business logic |
| AI / Data | Python | LLM: **Google Gemini** (credit sponsor) — SDK `google-genai` |
| Automation | n8n Cloud | Giao tiếp với backend qua webhook / HTTP request |
| Database | Supabase (PostgreSQL) |  |
| Version control | GitHub | `main` (ổn định) · `dev` (integration) · `feature/*` · `fix/*` |

---

## 4. 90 phút đầu tiên

| Phút | Việc |
|---|---|
| 0–15 | Mỗi người **tự đọc** Challenge, không brainstorm. Tìm: user, problem, pain point, constraints, sponsor requirements, data, API, resources, evaluation criteria. |
| 15–30 | Mỗi người trình bày: user là ai? problem thực sự? pain point? một solution đề xuất. |
| 30–50 | Chọn 2 ideas tốt nhất. |
| 50–65 | Chấm điểm mỗi idea, thang /5: problem impact · AI relevance · feasibility · demo potential · differentiation · team advantage · sponsor fit. |
| 65–75 | Chốt 1 solution — chọn cái làm tốt nhất được, không chọn vì "cool". |
| 75–90 | Khóa spec (bên dưới). |

**Spec khóa lúc phút 90:**

```
USER:
PROBLEM:
CURRENT WORKFLOW:
PAIN POINT:
SOLUTION:
WHY AI:
MVP:
SUCCESS METRIC:
DEMO FLOW:
ARCHITECTURE:
```

Sau 90 phút: **STOP brainstorming.** Chỉ đổi solution nếu phát hiện technically impossible.

---

## 5. Thứ tự phát triển

1. Proof of concept
2. Vertical slice
3. Integration
4. Core logic
5. Reliability
6. Evaluation
7. UI polish
8. Pitch

❌ **Không làm:** frontend hoàn chỉnh + backend hoàn chỉnh + AI hoàn chỉnh rồi integration ở cuối. Đây là chiến thuật rủi ro.

---

## 6. Feature freeze

Trước submission, không thêm feature. Chỉ: test · fix bug · evaluation · README · slides · backup video · pitch · Q&A.

---

**Templates:** [`templates/README_TEMPLATE.md`](templates/README_TEMPLATE.md) · [`templates/PITCH_TEMPLATE.md`](templates/PITCH_TEMPLATE.md)
