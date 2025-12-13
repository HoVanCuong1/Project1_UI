import React, { useEffect, useState } from "react";
import { searchAnnouncements } from "../config/api"; // Đổi đường dẫn theo dự án của bạn
import "./ManagerHome.css";

// URL gốc của server để hiển thị ảnh (nếu lưu local)
const BASE_URL = "http://localhost:8088"; 

const ManagerHome = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal xem chi tiết
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API để lấy tin cho MANAGER và tin chung (ALL)
        const [resManager, resAll] = await Promise.all([
          searchAnnouncements({ target: "MANAGER", pageSize: 5 }),
          searchAnnouncements({ target: "ALL", pageSize: 5 }),
        ]);

        // Lấy data từ response (cấu trúc axios-customize của bạn trả về data.result)
        // Lưu ý: Kiểm tra kỹ xem res trả về là gì dựa trên axios interceptor
        const listManager = resManager?.result || resManager?.data?.result || [];
        const listAll = resAll?.result || resAll?.data?.result || [];

        // Gộp mảng và sắp xếp theo ngày tạo mới nhất (desc)
        const mergedList = [...listManager, ...listAll].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setAnnouncements(mergedList);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Xử lý hiển thị ảnh
  const getImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/300x200?text=No+Image"; // Ảnh mặc định
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  return (
    <div className="manager-home-container">
      {/* --- HERO SECTION --- */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Xin chào, Manager!</h1>
          <p>Chúc bạn một ngày làm việc hiệu quả. Dưới đây là các tin tức mới nhất.</p>
        </div>
        <div className="hero-stat">
            <div className="stat-badge">
                <i className="bi bi-bell-fill"></i>
                <span>{announcements.length} Thông báo mới</span>
            </div>
        </div>
      </div>

      {/* --- ANNOUNCEMENTS LIST --- */}
      <div className="content-section">
        <h3 className="section-title">
            <i className="bi bi-megaphone-fill me-2 text-primary"></i>
            Bảng tin nội bộ
        </h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Đang tải bản tin...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="empty-state">
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png" alt="Empty" width="100"/>
            <p>Hiện không có thông báo nào.</p>
          </div>
        ) : (
          <div className="news-grid">
            {announcements.map((item) => (
              <div key={item.id} className="news-card" onClick={() => setSelectedNews(item)}>
                <div className="news-image-wrapper">
                    <img 
                        src={getImageUrl(item.imageUrl)} 
                        alt={item.title} 
                        className="news-img"
                        onError={(e) => {e.target.onerror = null; e.target.src="https://via.placeholder.com/300x200?text=Ktx+News"}}
                    />
                    <span className={`news-badge ${item.target}`}>
                        {item.target === "ALL" ? "Toàn bộ" : "Quản lý"}
                    </span>
                </div>
                <div className="news-body">
                  <h5 className="news-title">{item.title}</h5>
                  <div className="news-meta">
                    <i className="bi bi-calendar3 me-1"></i>
                    {formatDate(item.createdAt)}
                  </div>
                  <p className="news-summary">
                    {item.summary || "Không có tóm tắt nội dung..."}
                  </p>
                  <button className="btn-read-more">Xem chi tiết →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL CHI TIẾT --- */}
      {selectedNews && (
        <div className="news-modal-overlay" onClick={() => setSelectedNews(null)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <span className={`target-badge ${selectedNews.target}`}>
                    {selectedNews.target}
                </span>
                <button className="close-btn" onClick={() => setSelectedNews(null)}>×</button>
            </div>
            
            {selectedNews.imageUrl && (
                <img 
                    src={getImageUrl(selectedNews.imageUrl)} 
                    alt="Cover" 
                    className="modal-cover-img" 
                />
            )}
            
            <div className="modal-body">
                <h2 className="modal-title">{selectedNews.title}</h2>
                <p className="modal-date text-muted">
                    <i className="bi bi-clock"></i> Đăng ngày: {formatDate(selectedNews.createdAt)}
                </p>
                <div className="modal-divider"></div>
                {/* Render nội dung HTML hoặc Text */}
                <div className="modal-text">
                    {selectedNews.content.split('\n').map((str, index) => <p key={index}>{str}</p>)}
                </div>
            </div>
            
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedNews(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerHome;