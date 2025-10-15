import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SisUtcLayout from "./SisUtcLayout/SisUtcLayout";
import Home from "./pages/Home";
import News from "./pages/News";
import Bookings from "./pages/Bookings";
import BookingRoom from "./pages/BookingRoom";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SisUtcLayout />}>
          <Route index element={<Home />} />
          <Route path="news" element={<News />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="booking_room" element={<BookingRoom />} />
        </Route>
      </Routes>
    </Router>
  );
}
