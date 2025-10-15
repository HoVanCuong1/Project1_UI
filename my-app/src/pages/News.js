import React from "react";
import "./News.css";

export default function News() {
  const newsList = [
    {
      id: 1,
      title: "Sinh viên UTC đạt giải cao trong cuộc thi sáng tạo trẻ 2025",
      date: "10/10/2025",
      description:
        "Nhóm sinh viên khoa CNTT Trường Đại học GTVT đã xuất sắc giành giải Nhì tại cuộc thi sáng tạo trẻ toàn quốc với đề tài về trí tuệ nhân tạo trong giao thông.",
      image: "/images/news1.jpg",
    },
    {
      id: 2,
      title: "Thông báo lịch nghỉ lễ Quốc khánh 2/9/2025",
      date: "01/09/2025",
      description:
        "Nhà trường thông báo lịch nghỉ lễ Quốc khánh 2/9 dành cho sinh viên và cán bộ, giảng viên. Thời gian nghỉ từ 31/8 đến hết 2/9/2025.",
      image: "/images/news2.jpg",
    },
    {
      id: 3,
      title: "Khai mạc năm học mới 2025-2026",
      date: "05/09/2025",
      description:
        "Buổi lễ khai giảng năm học mới 2025-2026 được tổ chức trọng thể tại sân trường với sự tham dự của Ban giám hiệu và đông đảo sinh viên các khóa.",
      image: "/images/news3.jpg",
    },
  ];

  return (
    <div className="news-page">
      <h2>Tin tức & Thông báo</h2>
      <div className="news-list">
        {newsList.map((news) => (
          <div key={news.id} className="news-card">
            <img src={news.image} alt={news.title} />
            <div className="news-content">
              <h3>{news.title}</h3>
              <p className="news-date">{news.date}</p>
              <p className="news-desc">{news.description}</p>
              <button className="news-btn">Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
