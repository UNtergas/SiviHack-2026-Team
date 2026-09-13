# Technical Notes — SiviHack 2026

## 1. Trước khi chốt ý tưởng

> **Bỏ LLM ra thì sản phẩm còn chạy không?** Còn → AI đang ở chỗ sai.

Nếu thay LLM bằng một câu query, một cái form, hay vài dòng if-else mà sản phẩm vẫn làm được đúng việc đó, thì AI chỉ là lớp trang trí. Chỗ AI nên đứng là chỗ input không có cấu trúc (văn bản tự do, tài liệu, dữ liệu bẩn) hoặc chỗ cần suy luận/tổng hợp mà không viết được thành rule.

---

## 2. Quyết định kiến trúc

**n8n làm backend/proxy luôn?**

- *Được:*
  - **Webhook node = endpoint sẵn.** Mỗi workflow có một Webhook node, n8n phát ra một URL public — frontend `fetch` thẳng vào URL đó y như gọi API của mình, không phải dựng server riêng.
  - **Demo mở canvas cho giám khảo xem.** Chạy pipeline và các node sáng lên theo thứ tự — trực quan hơn nhiều so với log terminal, và cho thấy luồng xử lý thật thay vì chỉ nói bằng slide.
  - Tiết kiệm được toàn bộ thời gian setup + deploy backend.
- *Mất:*
  - **Shape dữ liệu giữa các node.** Mọi thứ truyền giữa các node là array of objects, mỗi item bọc trong key `json`: `[{json: {...}}]`. Một node trả *một* item chứa list khác với trả *N* item — node `Split Out` tồn tại đúng để chuyển từ dạng đầu sang dạng sau. Thêm một lớp nữa là item linking: `.item` báo lỗi khi thread bị đứt hoặc trỏ tới nhiều item trong node trước; thoát bằng `.first()` / `.last()` / `.all()[i]`.

**Có thật sự cần DB không?** State in-memory (biến/Map trong process, hoặc React state) hoặc một Google Sheet — n8n có node Sheets sẵn, đọc-ghi không cần code — đủ cho phần lớn bài toán kiểu này.

---

## 3. Limit Gemini

Hạn mức API có giới hạn → thiết kế quanh nó từ đầu:

- **Cache kết quả theo hash input.** Hash chuỗi input (prompt + tham số) làm key, lưu response vào Map/file/localStorage. Cùng một input thì trả từ cache, không gọi lại. Lúc dev sẽ gọi lặp lại rất nhiều lần với cùng input — đây là chỗ đốt credit nhiều nhất.
- **Mock response khi build UI / streaming.** Lấy vài response thật một lần, lưu thành file JSON, rồi làm UI trên đó. Làm layout và streaming không cần model thật.
- Chỉ gọi thật khi verify pipeline hoặc chuẩn bị demo.

---

## 4. Frontend

- **Streaming + async state.** LLM call 5–30s và có thể fail. Dùng SSE hoặc đọc `ReadableStream` từ response rồi render dần từng đoạn text; pipeline nhiều bước thì hiện đang ở bước nào; có lỗi thì retry được. Demo đứng im 20s -> điểm trừ.
- **Boilerplate deploy sẵn trước ngày thi:** Vite + React + Tailwind + chat/stream + bảng + form upload, đẩy lên Vercel cho chắc là deploy được. Ngày thi clone và đổi logic.
- Dữ liệu doanh nghiệp: `papaparse` / SheetJS cho CSV-Excel, bảng có filter, `recharts` cho chart.
- Loading / empty / error state phải đầy đủ.

---

## 5. Prompt

- **Tách ra file riêng**, không hardcode rải rác trong code. Sửa một chỗ, và biết chỗ đó ở đâu.
- **Version trong git.** Khi output tệ đi, `git diff` cho thấy đã đổi chữ gì.
- **Giữ vài input mẫu để chạy lại sau mỗi lần sửa.** Bộ này đóng vai regression test thủ công: sửa prompt xong chạy lại 3–4 input cũ, thấy cái nào hỏng thì biết ngay.

---

## 6. Ngày thi

1. **Deploy từ tối ngày 1.** Lần deploy đầu luôn có vấn đề (env var, build config, CORS). 
2. **Chốt một trong hai hướng, cả hai đều phải demo được:**
   - **A — Docker hoá toàn bộ** (self-host n8n trong cùng `docker compose`): demo chạy offline, không phụ thuộc wifi tại chỗ.
   - **B — Internet toàn bộ** (n8n Cloud + frontend deploy): dùng được voucher, setup nhẹ hơn. Đánh đổi: mạng là single point of failure → phải có hotspot 4G, cộng video demo (§6.3) và cache (§6.4) làm lớp dự phòng.
3. **Quay video demo 60–90s trước 15h.** Mạng chết hoặc Gemini lỗi thì vẫn có cái để chiếu.
4. **Cache sẵn kết quả LLM cho luồng demo chính**, để không phụ thuộc mạng và không hết hạn mức giữa buổi.
   ⚠️ **Phải nói thẳng với giám khảo là đang dùng cached response.** Q&A dài 7 phút và có người rà codebase — khả năng bị phát hiện là cao. Nói trước thì đó là một quyết định kỹ thuật hợp lý; bị phát hiện thì thành vấn đề trung thực, và mất nhiều hơn phần điểm demo.
5. URL ngắn hoặc QR trong slide để giám khảo tự mở.

---

## 7. Repo sẽ bị chấm

Technical Assistants (có AI hỗ trợ) rà repo để đối chiếu code với giải pháp trình bày.

- Cấu trúc thư mục rõ, README đúng yêu cầu, có `requirements.txt` / `package.json`.
- **Commit đều trong 24h thi, đừng dồn 1 commit cuối.** Lịch sử commit cho thấy quá trình làm.
- ⚠️ Logic ở n8n → **export workflow JSON commit vào repo** (Workflow → Download, để vào `/workflows/`, README trỏ tới). Không làm thì codebase trông như chỉ có frontend, trong khi phần xử lý chính lại nằm ở chỗ không ai xem được.