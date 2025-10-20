import { Link } from "react-router-dom";
import ".";

export default function Sidebar() {
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
          <Link to="/payment-electricity">Thanh toán tiền điện</Link>
        </li>
        <li>
          <Link to="/payment-water">Thanh toán tiền nước</Link>
        </li>
        <li>
          <Link to="/payment-room">Thanh toán tiền phòng</Link>
        </li>
      </ul>
    </aside>
  );
}
