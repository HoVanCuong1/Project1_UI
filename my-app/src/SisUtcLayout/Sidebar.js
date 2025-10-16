import { Link } from "react-router-dom";
import ".";

export default function Sidebar() {
  return (
    <aside className="sis-sidebar">
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/news">News</Link>
        </li>
        <li>
          <Link to="/bookings">Bookings</Link>
        </li>
        <li>
          <Link to="/electricity-water">Electricity water usage</Link>
        </li>
        <li>
          <Link to="/payment-history">Payment history</Link>
        </li>
      </ul>
    </aside>
  );
}
