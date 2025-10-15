import React from "react";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import "./Bookings.css";

export default function Bookings() {
  const bookings = [
    {
      dom: "F",
      floor: 4,
      bed: "-",
      semester: "Fall",
      year: 2024,
      roomType: "SVVN - 4 beds - 1.050.000",
      createdDate: "02/08/2024 21:52",
      status: "Accepted",
      note: "F407R",
    },
    {
      dom: "A",
      floor: 5,
      bed: "A514R - 3",
      semester: "Summer",
      year: 2024,
      roomType: "SVVN - 6 beds - 850.000",
      createdDate: "20/04/2024 07:58",
      status: "Accepted",
      note: "Giữ Giường Cũ.",
    },
    {
      dom: "A",
      floor: 5,
      bed: "A514R - 3",
      semester: "Spring",
      year: 2024,
      roomType: "SVVN - 6 beds - 850.000",
      createdDate: "12/12/2023 13:32",
      status: "Accepted",
      note: "Giữ Giường Cũ.",
    },
  ];

  return (
    <div className="bookings-container">
      <h2 className="bookings-title">Bookings List</h2>
      <p className="warning-text">
        (You can only continue to booking when there are no longer bookings
        record in Pending status)
      </p>

      <NavLink to="/booking_room" className="booking-btn">
        Booking Bed
      </NavLink>

      <table className="bookings-table">
        <thead>
          <tr>
            <th>Dom</th>
            <th>Floor</th>
            <th>Bed</th>
            <th>Semester</th>
            <th>Year</th>
            <th>Room Type</th>
            <th>Created Date</th>
            <th>Status</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => (
            <tr
              key={i}
              className={b.status === "Accepted" ? "accepted-row" : ""}
            >
              <td>{b.dom}</td>
              <td>{b.floor}</td>
              <td>{b.bed}</td>
              <td>{b.semester}</td>
              <td>{b.year}</td>
              <td>{b.roomType}</td>
              <td>{b.createdDate}</td>
              <td className="status accepted">{b.status}</td>
              <td>{b.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
