import { Link } from "react-router-dom";
import ".";

export default function SidebarLayout() {
  return (
    <aside className="sis-sidebar">
      <ul>
        <li>
          <Link to="/">Trang Chủ</Link>
        </li>
        <li>
          <Link to="/news">Tin Tức</Link>
        </li>
        <li>
          <Link to="/bookings">Đăng Kí Phòng</Link>
        </li>
        <li>
          <Link to="/payments">Thanh toán</Link>
        </li>
        <li>
          <Link to="/payment-historys">Lịch sử thanh toán</Link>
        </li>
      </ul>
    </aside>
  );
}
