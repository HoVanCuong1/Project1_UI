import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { searchAnnouncements, _arr } from "../config/api";

export default function Home() {
  const navigate = useNavigate();

  // Announcements
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [errNews, setErrNews] = useState("");

  // Load 3 thông báo mới nhất cho block Home
  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      setErrNews("");

      const channel = "WEB";
      const [resAll, resStu] = await Promise.all([
        searchAnnouncements({
          target: "ALL",
          channel,
          pageIndex: 0,
          pageSize: 5,
        }),
        searchAnnouncements({
          target: "STUDENT",
          channel,
          pageIndex: 0,
          pageSize: 5,
        }),
      ]);

      const arrAll = _arr(resAll);
      const arrStu = _arr(resStu);

      const map = new Map();
      [...arrAll, ...arrStu].forEach((x) => x?.id && map.set(x.id, x));
      const merged = Array.from(map.values());

      merged.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );

      setNews(merged.slice(0, 3));
    } catch (e) {
      console.error(e);
      setErrNews("Không tải được tin tức & thông báo.");
      setNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);


  return (
    <div className="home-page">

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <p className="hero-chip">Hệ thống Quản lý Ký túc xá UTC</p>

          <h1 className="hero-title">
            Ký túc xá Đại học GTVT  
            <span>— hiện đại • tiện lợi • minh bạch</span>
          </h1>

          <p className="hero-sub">
            Đăng ký phòng, xem thông báo, thanh toán và gửi yêu cầu hỗ trợ  
            ngay trên hệ thống trực tuyến dành cho sinh viên.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/bookings")}
            >
              🚀 Bắt đầu đăng ký ở KTX
            </button>

            <button
              className="btn btn-light"
              onClick={() =>
                document.getElementById("ktx-flow")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              📘 Xem hướng dẫn
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">🏫 3 Khu ký túc xá</div>
            <div className="stat-dot">•</div>
            <div className="stat-item">👨‍🎓 Hơn 1200 sinh viên</div>
            <div className="stat-dot">•</div>
            <div className="stat-item">🔧 Hỗ trợ 24/7</div>
          </div>
        </div>
      </section>

      {/* ===== FLOW SECTION ===== */}
      <section className="flow-section" id="ktx-flow">
        <h2 className="section-title">Quy trình đăng ký ở ký túc xá</h2>
        <p className="section-sub">
          Tất cả các bước đều được thực hiện trực tuyến và dễ dàng.
        </p>

        <div className="flow-grid">

          <div className="flow-card">
            <div className="flow-icon">1️⃣</div>
            <h3>Cập nhật hồ sơ sinh viên</h3>
            <p>
              Điền đầy đủ thông tin cá nhân, lớp, khóa, liên hệ và các thông tin cần thiết.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-icon">2️⃣</div>
            <h3>Chọn phòng & gửi đăng ký</h3>
            <p>
              Tìm phòng theo khu – tầng – loại phòng và gửi yêu cầu đăng ký.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-icon">3️⃣</div>
            <h3>Chờ duyệt & thanh toán</h3>
            <p>
              Ban quản lý xét duyệt. Khi được chấp nhận, tiến hành thanh toán trực tuyến.
            </p>
          </div>

          <div className="flow-card">
            <div className="flow-icon">4️⃣</div>
            <h3>Trong thời gian ở</h3>
            <p>
              Gửi yêu cầu sửa chữa, trả phòng hoặc khiếu nại bất cứ lúc nào.
            </p>
          </div>

        </div>
      </section>

      {/* ===== QUICK LINKS ===== */}
      <section className="quick-section">
        <div className="quick-grid">

          <div className="quick-card">
            <h3>Truy cập nhanh</h3>
            <div className="quick-links">
              <button className="link-chip" onClick={() => navigate("/news")}>📢 Tin tức</button>

              <button className="link-chip" onClick={() => navigate("/request_Fix")}>
                🛠 Yêu cầu sửa chữa
              </button>

              <button className="link-chip" onClick={() => navigate("/request_Transfer")}>
                🏠 Yêu cầu trả phòng
              </button>

              <button className="link-chip" onClick={() => navigate("/complaint")}>
                📩 Gửi khiếu nại
              </button>
            </div>
          </div>

          <div className="quick-card">
            <h3>Liên hệ ban quản lý</h3>
            <ul className="contact-list">
              <li>📞 Hotline: <b>0123 456 789</b></li>
              <li>✉️ Email: <b>ktx@utc.edu.vn</b></li>
              <li>⏰ Giờ làm việc: <b>Thứ 2 - Thứ 6</b></li>
            </ul>
            <p className="contact-note">
              *Thông tin liên hệ chỉ mang tính minh họa.
            </p>
          </div>

        </div>
      </section>


      <section className="home-section home-news-section"> 
<div className="home-news-header"> 
<div> 
<h2 className="home-section-title">Tin tức & Thông báo mới</h2> 
<p className="home-section-sub"> 
Cập nhật những thông báo quan trọng về ký túc xá: thời gian đăng ký, 
bảo trì, nộp tiền phòng… 
</p> 
</div> 
<button 
className="btn btn-outline" 
onClick={() => navigate("/news")} 
> 
Xem tất cả 
</button> 
</div> 
{loadingNews ? ( 
<p className="muted">Đang tải thông báo...</p> 
) : errNews ? ( 
<p className="warning">{errNews}</p> 
) : news.length === 0 ? ( 
<p className="muted">Hiện chưa có thông báo nào.</p> 
) : ( 
<div className="home-news-grid"> 
{news.map((n) => ( 
<div key={n.id} className="news-card-mini"> 
<div className="news-mini-header"> 
<span className="news-mini-tag"> 
{n.target === "ALL" 
? "Tất cả sinh viên" 
: n.target === "STUDENT" 
? "Sinh viên" 
: n.target} 
</span> 
<span className="news-mini-date"> 
{n.createdAt 
? new Date(n.createdAt).toLocaleString() 
: "-"} 
</span> 
</div> 
<h3 className="news-mini-title">{n.title}</h3> 
<p className="news-mini-desc"> 
{n.summary || n.content || "Xem chi tiết nội dung thông báo."} 
</p> 
<button 
className="news-mini-btn" 
onClick={() => navigate(`/news/${n.id}`)} 
> 
Xem chi tiết → 
</button> 
</div> 
))} 
</div> 
)} 
</section> 

    </div>
  );
}
