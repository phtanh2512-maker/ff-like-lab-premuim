# FF LIKE LAB — bộ code triển khai Vercel

Bộ này gồm giao diện hiện tại (`index.html`) và backend serverless (`api/player-info.js`) để tra cứu thông tin UID qua Free Fire Community API.

> Lưu ý: endpoint tra cứu chỉ lấy thông tin người chơi, không tăng like. Chưa có API tăng like chính thức/được ủy quyền nào được cấu hình ở đây. Free Fire Community là dịch vụ bên thứ ba; hãy kiểm tra tài liệu và điều khoản API hiện hành trước khi dùng.

## Triển khai nhanh lên Vercel

1. Giải nén thư mục này.
2. Đưa các file `index.html`, `README.md` và thư mục `api/` lên một repository GitHub mới.
3. Vào https://vercel.com/new, import repository đó và nhấn **Deploy**. Với cấu trúc này, không cần framework hay build command.
4. Trong Vercel, mở **Project → Settings → Environment Variables** và thêm:
   - Name: `FREE_FIRE_API_KEY`
   - Value: API key lấy từ tài khoản Free Fire Community của bạn
   - Environment: Production (thêm Preview/Development nếu cần)
5. Redeploy project sau khi thêm biến môi trường.
6. Mở `https://TEN-DOMAIN-VERCEL.vercel.app/api/player-info?uid=10000001&region=sg` để kiểm tra. Thay domain bằng domain thật; dùng UID thật để kiểm tra.

## Chạy thử trên máy tính (tùy chọn)

Cần cài Node.js LTS. Mở terminal tại thư mục dự án và chạy:

```bash
npm install -g vercel
vercel dev
```

Tạo file `.env.local` trong thư mục dự án, nội dung:

```dotenv
FREE_FIRE_API_KEY=dan_api_key_cua_ban_o_day
```

Chạy `vercel dev` sau khi tạo file. Không tải `.env.local` lên GitHub, không gửi API key qua chat và không đặt key vào `index.html`.

## Bảo mật và xử lý lỗi

- API key chỉ được đọc ở backend qua `process.env.FREE_FIRE_API_KEY`.
- Không bật log chứa header `x-api-key`.
- Endpoint có timeout 10 giây, kiểm tra UID, không cache phản hồi và không chuyển nội dung lỗi upstream về trình duyệt.
- Bộ code chưa có rate limit dùng chung giữa các serverless instance. Trước khi mở công khai, nên bổ sung rate limiting qua dịch vụ lưu trữ dùng chung và theo dõi hạn mức API.
- Nếu gặp lỗi 502, kiểm tra tài liệu/schema hiện hành của nhà cung cấp; định dạng phản hồi có thể thay đổi.

## Cấu trúc

```text
ff-like-lab/
├── index.html
├── README.md
└── api/
    └── player-info.js
```
