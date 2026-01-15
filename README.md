# Dự Án Frontend Quản Lý Sản Phẩm - ReactJS

Đây là một dự án frontend được xây dựng bằng React cho một hệ thống quản lý bán hàng, bao gồm các chức năng cho cả khách hàng và quản trị viên.

## Công nghệ sử dụng

-   **Framework:** ReactJS
-   **Routing:** `react-router-dom`
-   **Quản lý trạng thái:** React Context API
-   **Styling:** CSS thuần (với cấu trúc CSS-per-component)
-   **HTTP Client:** `fetch` hoặc `axios` (thông qua `services/api.js`)

---

## Những Gì Đã Làm Được (Tính Năng Hiện Có)

Dự án đã xây dựng được một nền tảng vững chắc với các tính năng cốt lõi cho một trang thương mại điện tử.

### 1. Phía Khách Hàng (Client)

-   **Xác thực người dùng:** Đăng nhập, Đăng ký.
-   **Trang cửa hàng:**
    -   Hiển thị sản phẩm dưới dạng lưới hoặc danh sách.
    -   Giao diện thẻ sản phẩm (`ProductCard`) chi tiết, hiển thị các huy hiệu như "Hết hàng", "Sắp hết", "Sale", "Mới".
    -   Hiển thị giá gốc và giá đã giảm.
-   **Trang chi tiết sản phẩm:** Xem thông tin đầy đủ, hình ảnh của sản phẩm.
-   **Giỏ hàng:** Thêm sản phẩm vào giỏ, xem giỏ hàng.
-   **Thanh toán:** Giao diện cho quy trình thanh toán.
-   **Lọc sản phẩm:** Lọc sản phẩm theo các tiêu chí .

### 2. Phía Quản Trị Viên (Admin)

-   **Bảng điều khiển (Dashboard):** Giao diện tổng quan dành cho quản trị viên.
-   **Quản lý Sản phẩm:**
    -   Thêm và chỉnh sửa sản phẩm.
-   **Quản lý Danh mục:** Thêm, xóa, sửa danh mục sản phẩm.
-   **Quản lý Người dùng:** Xem và quản lý tài khoản người dùng.
-   **Quản lý Đơn hàng:** Xem và cập nhật trạng thái đơn hàng.
-   **Thống kê:** Giao diện xem báo cáo, thống kê doanh thu.

### 3. Cấu Trúc và Kỹ Thuật

-   **`ProtectedRoute`:** Bảo vệ các trang yêu cầu đăng nhập.
-   **`Context API`:** Quản lý trạng thái đăng nhập (`AuthContext`) và giỏ hàng (`CartContext`) toàn cục.
-   **Component Tái sử dụng:** `Toast` (Thông báo), `Skeleton` (Hiệu ứng tải), `ProductCard`.
-   **Service Layer:** Tách biệt logic gọi API ra khỏi component.

---

## Những Việc Cần Làm Tiếp Theo

Đây là danh sách các gợi ý để hoàn thiện và mở rộng dự án:

1.  **Hoàn Thiện Tích Hợp Backend:**
    -   Kết nối tất cả các chức năng với API backend.
    -   Xử lý triệt để các lỗi trả về từ API và hiển thị thông báo thân thiện.

2.  **Cải Thiện Trải Nghiệm Người Dùng (UX):**
    -   Thêm chức năng **Tìm kiếm** sản phẩm theo tên.
    -   Triển khai **Phân trang** cho các danh sách (sản phẩm, đơn hàng, người dùng).
    -   Xây dựng trang **Hồ sơ người dùng** (User Profile), cho phép người dùng xem lịch sử đơn hàng và cập nhật thông tin cá nhân.
    -   Phát triển tính năng **Đánh giá và Bình luận** sản phẩm.

3.  **Kiểm Thử (Testing):**
    -   Viết Unit Test cho các component và logic phức tạp bằng Jest và React Testing Library.
    -   Viết Integration Test cho các luồng quan trọng như thanh toán.

4.  **Tối Ưu Hóa (Optimization):**
    -   Lazy loading hình ảnh và các component để tăng tốc độ tải trang.
    -   Code-splitting để giảm kích thước bundle ban đầu.

---

## Hướng Dẫn Cài Đặt và Chạy Dự Án

1.  **Clone repository về máy:**
    ```sh
    git clone <your-repository-url>
    ```

2.  **Di chuyển vào thư mục dự án:**
    ```sh
    cd product-management-frontend
    ```

3.  **Cài đặt các dependencies:**
    ```sh
    npm install
    ```

4.  **Chạy dự án ở môi trường development:**
    ```sh
    npm start
    ```
    Mở trình duyệt và truy cập `http://localhost:3000`.

    *Lưu ý: Cần đảm bảo rằng server backend đang chạy ở `http://localhost:8080` để các chức năng liên quan đến API hoạt động.*