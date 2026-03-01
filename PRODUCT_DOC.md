# CineVault — Tài liệu sản phẩm (chi tiết)

Phiên bản: 1.0

---

## Tổng quan

CineVault là một ứng dụng web tĩnh hiển thị danh sách "Top Movies & Series" (dựa trên API IMDB Top 100 qua RapidAPI). Ứng dụng cho phép người dùng duyệt danh sách phim/seri, tìm kiếm, lọc theo thể loại, và xem chi tiết (mô tả, đạo diễn, trailer, liên kết IMDb).

Ứng dụng bao gồm các file chính:

- `index.html` — giao diện HTML chính.
- `style.css` — toàn bộ stylesheet, responsive và dark-themed.
- `script.js` — logic frontend: gọi API, quản lý state, render grid và trang chi tiết.

---

## Mục tiêu & đối tượng

- Mục tiêu: Cung cấp giao diện nhẹ, responsive để khám phá nhanh Top 100 movies/series theo IMDB.
- Đối tượng: Người dùng muốn tìm phim/seri nổi tiếng, developer muốn làm ví dụ về tích hợp RapidAPI và UI static.

---

## Tính năng chính

- Hiển thị lưới (grid) phim hoặc series với poster, xếp hạng, điểm IMDb.
- Tìm kiếm theo tiêu đề (search-as-you-type).
- Lọc theo thể loại (genre) được sinh tự động từ dữ liệu trả về.
- Trang chi tiết chứa: poster lớn, điểm đánh giá, năm, thể loại, mô tả, đạo diễn, trailer (embed) và nút mở IMDb.
- Skeleton loading cho trải nghiệm tải mượt.
- Responsive layout cho màn hình nhỏ và lớn.

---

## Kiến trúc & luồng hoạt động

1. `index.html` tải `style.css` và `script.js`.
2. Khi khởi tạo, `script.js` gọi hàm `renderGrid("movie")` để hiển thị trang Movies mặc định.
3. `renderGrid()` hiển thị skeleton, gọi API (`fetchMovies` / `fetchSeries`) rồi render danh sách.
4. Dữ liệu được lưu cache trong `moviesCache`/`seriesCache` để tránh gọi lại không cần thiết.
5. Người dùng có thể click vào card để gọi `renderDetail(id, "movie"|"series")` và xem trang chi tiết.

Luồng API:

- `fetchMovies()` → GET `${BASE_URL}/`
- `fetchSeries()` → GET `${BASE_URL}/series/`
- `fetchMovieDetail(id)` → GET `${BASE_URL}/${id}`
- `fetchSeriesDetail(id)` → GET `${BASE_URL}/series/${id}`

Lưu ý: `script.js` hiện đang chứa API key (RAPIDAPI_KEY) trực tiếp — điều này không an toàn cho môi trường production.

---

## Mô tả chi tiết các file

- `index.html` ([index.html](index.html): toàn bộ file tại gốc)
  - Cấu trúc: header (logo, nav), main container (`#main-content`) nơi `script.js` inject DOM.
  - Tích hợp font từ Google Fonts và import `style.css`.

- `style.css` ([style.css](style.css): toàn bộ file tại gốc)
  - Biến CSS ở `:root` (màu, radius, font).
  - Các component: header, page header (title + search), genre-filter, media-grid, media-card, detail page, skeleton.
  - Responsive breakpoints: 640px, 768px, 1024px.

- `script.js` ([script.js](script.js): toàn bộ file tại gốc)
  - State: `currentView`, `moviesCache`, `seriesCache`, `searchQuery`, `selectedGenre`.
  - Icons: object `icons` chứa SVG inline dùng trong UI.
  - DOM refs: `mainContent`, `navMovies`, `navSeries`.
  - Event delegation cho navigation (`data-nav`).
  - Hàm render: `renderSkeletonGrid()`, `renderGrid(type)`, `filterAndRenderCards(type)`, `renderDetail(id,type)`.
  - API calls: `fetchMovies()`, `fetchSeries()`, `fetchMovieDetail(id)`, `fetchSeriesDetail(id)`.

---

## Hướng dẫn cài đặt & chạy

Ứng dụng là static site, không cần build tool. Có 2 cách chạy:

1) Mở trực tiếp file (không khuyến nghị nếu có CSP hoặc fetch từ file://):

   - Mở `index.html` trong trình duyệt.

2) Chạy server tĩnh nhẹ (khuyến nghị):

   - Với Python 3 (trong thư mục dự án):

```bash
python -m http.server 8000
```

   - Mở `http://localhost:8000` trong trình duyệt.

Lưu ý: Do `script.js` gọi API từ RapidAPI (CORS) nên chạy trên http(s) server thường cho kết quả tốt hơn.

---

## Cấu hình & bảo mật

- Hiện tại `script.js` chứa `RAPIDAPI_KEY` (hard-coded). Điều này tiềm ẩn rủi ro lộ khoá khi public repo. Khuyến nghị:
  - Di chuyển key ra server-side proxy hoặc serverless function.
  - Hoặc nếu bắt buộc để trên client, dùng biến môi trường trong quá trình deploy (ví dụ Netlify env vars) và build-time injection.

- Nếu triển khai production, tạo endpoint backend (ví dụ Node/Express) để gọi RapidAPI và trả dữ liệu cho frontend, tránh lộ key.

---

## API / Events (tóm tắt)

- Các hàm fetch trong `script.js` tương tác với RapidAPI IMDB Top 100:
  - `fetchMovies()`, `fetchSeries()`, `fetchMovieDetail(id)`, `fetchSeriesDetail(id)`.

- Event listeners:
  - Click delegation trên document cho `data-nav` (chuyển Movies/Series).
  - Input event trên `.search-input` để cập nhật `searchQuery` và lọc.
  - Click trên `.genre-btn` để thay đổi `selectedGenre`.
  - Click trên `.media-card` để mở detail.
  - Click trên `.back-btn` (trong detail) để quay lại grid.

---

## Tuỳ chỉnh & mở rộng

- Thay đổi theme: chỉnh các biến trong `:root` của `style.css`.
- Thêm paginations: hiện tại toàn bộ items được tải và lọc client-side; để scale, implement pagination/server-side fetch.
- Lưu trữ cache lâu hơn: hiện cache tồn tại trong runtime (biến JS). Có thể lưu vào `localStorage` hoặc IndexedDB.
- Thêm bộ lọc nâng cao: năm phát hành, điểm đánh giá, quốc gia.
- Thêm tính năng lưu yêu thích: localStorage + UI cho danh sách Favorite.

---

## Kiểm thử

- Manual:
  - Kiểm tra load grid Movies/Series.
  - Tìm kiếm và lọc theo genre.
  - Mở trang detail kiểm tra trailer, description, liên kết IMDb.
  - Tắt network để kiểm tra error state (empty/error messages).

- Automated (gợi ý):
  - Viết E2E test (Playwright / Cypress) để assert các luồng: load grid, search, open detail, back.

---

## Triển khai

- Đơn giản: host trên GitHub Pages, Netlify, Vercel (static site). Nếu muốn bảo mật key, cần trung gian serverless function:
  - Ví dụ: Netlify Function, Vercel Serverless Function, hoặc small Express API.

---

## Vấn đề thường gặp & khắc phục

- Lỗi fetch (Failed to fetch / CORS):
  - Kiểm tra console lỗi; nếu là CORS, cần proxy server hoặc enable CORS trên backend.
  - Đảm bảo chạy trên http(s) server (không dùng file://).

- Dữ liệu trống / No results found:
  - Kiểm tra trường `genre`/`title` của data trả về.
  - Kiểm tra `moviesCache`/`seriesCache` và `window._currentItems`.

- Key bị lộ:
  - Xóa key khỏi repo, tạo key mới và di chuyển gọi API sang server.

---

## Contribution

- Bất kỳ thay đổi nào xin tạo pull request. Đề xuất các task:
  - Tách API key khỏi `script.js` (PR priority cao).
  - Thêm unit/E2E tests.
  - Thêm i18n (hiện UI tiếng Anh mặc định).

---

## Liên hệ

Nếu bạn muốn tôi mở rộng tài liệu (thêm ví dụ hình ảnh, GIF, hoặc bước deploy cụ thể lên Netlify/Vercel), hãy cho biết ưu tiên: 1) Bảo mật key + proxy, 2) Tests + CI, 3) Hướng dẫn deploy cụ thể.

---

*Tài liệu này được tạo tự động bởi trợ lý phát triển — bạn có muốn tôi cập nhật README chính hoặc commit thay đổi này vào git?*
# CineVault — Tài liệu sản phẩm (chi tiết)

Phiên bản: 1.0

---

## Tổng quan

CineVault là một ứng dụng web tĩnh hiển thị danh sách "Top Movies & Series" (dựa trên API IMDB Top 100 qua RapidAPI). Ứng dụng cho phép người dùng duyệt danh sách phim/seri, tìm kiếm, lọc theo thể loại, và xem chi tiết (mô tả, đạo diễn, trailer, liên kết IMDb).

Ứng dụng bao gồm các file chính:

- `index.html` — giao diện HTML chính.
- `style.css` — toàn bộ stylesheet, responsive và dark-themed.
- `script.js` — logic frontend: gọi API, quản lý state, render grid và trang chi tiết.

---

## Mục tiêu & đối tượng

- Mục tiêu: Cung cấp giao diện nhẹ, responsive để khám phá nhanh Top 100 movies/series theo IMDB.
- Đối tượng: Người dùng muốn tìm phim/seri nổi tiếng, developer muốn làm ví dụ về tích hợp RapidAPI và UI static.

---

## Tính năng chính

- Hiển thị lưới (grid) phim hoặc series với poster, xếp hạng, điểm IMDb.
- Tìm kiếm theo tiêu đề (search-as-you-type).
- Lọc theo thể loại (genre) được sinh tự động từ dữ liệu trả về.
- Trang chi tiết chứa: poster lớn, điểm đánh giá, năm, thể loại, mô tả, đạo diễn, trailer (embed) và nút mở IMDb.
- Skeleton loading cho trải nghiệm tải mượt.
- Responsive layout cho màn hình nhỏ và lớn.

---

## Kiến trúc & luồng hoạt động

1. `index.html` tải `style.css` và `script.js`.
2. Khi khởi tạo, `script.js` gọi hàm `renderGrid("movie")` để hiển thị trang Movies mặc định.
3. `renderGrid()` hiển thị skeleton, gọi API (`fetchMovies` / `fetchSeries`) rồi render danh sách.
4. Dữ liệu được lưu cache trong `moviesCache`/`seriesCache` để tránh gọi lại không cần thiết.
5. Người dùng có thể click vào card để gọi `renderDetail(id, "movie"|"series")` và xem trang chi tiết.

Luồng API:

- `fetchMovies()` → GET `${BASE_URL}/`
- `fetchSeries()` → GET `${BASE_URL}/series/`
- `fetchMovieDetail(id)` → GET `${BASE_URL}/${id}`
- `fetchSeriesDetail(id)` → GET `${BASE_URL}/series/${id}`

Lưu ý: `script.js` hiện đang chứa API key (RAPIDAPI_KEY) trực tiếp — điều này không an toàn cho môi trường production.

---

## Mô tả chi tiết các file

- `index.html` ([index.html](index.html): toàn bộ file tại gốc)
  - Cấu trúc: header (logo, nav), main container (`#main-content`) nơi `script.js` inject DOM.
  - Tích hợp font từ Google Fonts và import `style.css`.

- `style.css` ([style.css](style.css): toàn bộ file tại gốc)
  - Biến CSS ở `:root` (màu, radius, font).
  - Các component: header, page header (title + search), genre-filter, media-grid, media-card, detail page, skeleton.
  - Responsive breakpoints: 640px, 768px, 1024px.

- `script.js` ([script.js](script.js): toàn bộ file tại gốc)
  - State: `currentView`, `moviesCache`, `seriesCache`, `searchQuery`, `selectedGenre`.
  - Icons: object `icons` chứa SVG inline dùng trong UI.
  - DOM refs: `mainContent`, `navMovies`, `navSeries`.
  - Event delegation cho navigation (`data-nav`).
  - Hàm render: `renderSkeletonGrid()`, `renderGrid(type)`, `filterAndRenderCards(type)`, `renderDetail(id,type)`.
  - API calls: `fetchMovies()`, `fetchSeries()`, `fetchMovieDetail(id)`, `fetchSeriesDetail(id)`.

---

## Hướng dẫn cài đặt & chạy

Ứng dụng là static site, không cần build tool. Có 2 cách chạy:

1) Mở trực tiếp file (không khuyến nghị nếu có CSP hoặc fetch từ file://):

   - Mở `index.html` trong trình duyệt.

2) Chạy server tĩnh nhẹ (khuyến nghị):

   - Với Python 3 (trong thư mục dự án):

```bash
python -m http.server 8000
```

   - Mở `http://localhost:8000` trong trình duyệt.

Lưu ý: Do `script.js` gọi API từ RapidAPI (CORS) nên chạy trên http(s) server thường cho kết quả tốt hơn.

---

## Cấu hình & bảo mật

- Hiện tại `script.js` chứa `RAPIDAPI_KEY` (hard-coded). Điều này tiềm ẩn rủi ro lộ khoá khi public repo. Khuyến nghị:
  - Di chuyển key ra server-side proxy hoặc serverless function.
  - Hoặc nếu bắt buộc để trên client, dùng biến môi trường trong quá trình deploy (ví dụ Netlify env vars) và build-time injection.

- Nếu triển khai production, tạo endpoint backend (ví dụ Node/Express) để gọi RapidAPI và trả dữ liệu cho frontend, tránh lộ key.

---

## API / Events (tóm tắt)

- Các hàm fetch trong `script.js` tương tác với RapidAPI IMDB Top 100:
  - `fetchMovies()`, `fetchSeries()`, `fetchMovieDetail(id)`, `fetchSeriesDetail(id)`.

- Event listeners:
  - Click delegation trên document cho `data-nav` (chuyển Movies/Series).
  - Input event trên `.search-input` để cập nhật `searchQuery` và lọc.
  - Click trên `.genre-btn` để thay đổi `selectedGenre`.
  - Click trên `.media-card` để mở detail.
  - Click trên `.back-btn` (trong detail) để quay lại grid.

---

## Tuỳ chỉnh & mở rộng

- Thay đổi theme: chỉnh các biến trong `:root` của `style.css`.
- Thêm paginations: hiện tại toàn bộ items được tải và lọc client-side; để scale, implement pagination/server-side fetch.
- Lưu trữ cache lâu hơn: hiện cache tồn tại trong runtime (biến JS). Có thể lưu vào `localStorage` hoặc IndexedDB.
- Thêm bộ lọc nâng cao: năm phát hành, điểm đánh giá, quốc gia.
- Thêm tính năng lưu yêu thích: localStorage + UI cho danh sách Favorite.

---

## Kiểm thử

- Manual:
  - Kiểm tra load grid Movies/Series.
  - Tìm kiếm và lọc theo genre.
  - Mở trang detail kiểm tra trailer, description, liên kết IMDb.
  - Tắt network để kiểm tra error state (empty/error messages).

- Automated (gợi ý):
  - Viết E2E test (Playwright / Cypress) để assert các luồng: load grid, search, open detail, back.

---

## Triển khai

- Đơn giản: host trên GitHub Pages, Netlify, Vercel (static site). Nếu muốn bảo mật key, cần trung gian serverless function:
  - Ví dụ: Netlify Function, Vercel Serverless Function, hoặc small Express API.

---

## Vấn đề thường gặp & khắc phục

- Lỗi fetch (Failed to fetch / CORS):
  - Kiểm tra console lỗi; nếu là CORS, cần proxy server hoặc enable CORS trên backend.
  - Đảm bảo chạy trên http(s) server (không dùng file://).

- Dữ liệu trống / No results found:
  - Kiểm tra trường `genre`/`title` của data trả về.
  - Kiểm tra `moviesCache`/`seriesCache` và `window._currentItems`.

- Key bị lộ:
  - Xóa key khỏi repo, tạo key mới và di chuyển gọi API sang server.

---

## Contribution

- Bất kỳ thay đổi nào xin tạo pull request. Đề xuất các task:
  - Tách API key khỏi `script.js` (PR priority cao).
  - Thêm unit/E2E tests.
  - Thêm i18n (hiện UI tiếng Anh mặc định).

---

## Liên hệ

Nếu bạn muốn tôi mở rộng tài liệu (thêm ví dụ hình ảnh, GIF, hoặc bước deploy cụ thể lên Netlify/Vercel), hãy cho biết ưu tiên: 1) Bảo mật key + proxy, 2) Tests + CI, 3) Hướng dẫn deploy cụ thể.

---

*Tài liệu này được tạo tự động bởi trợ lý phát triển — bạn có muốn tôi cập nhật README chính hoặc commit thay đổi này vào git?*
