import React, { useEffect, useMemo, useState } from "react";
import "./News.css";
import { searchAnnouncements, _arr } from "../../config/api";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:8088";

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl; // đã là absolute
  // BE trả "/uploads/announcements/xxx.jpg" -> prefix base
  return `${API_BASE}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export default function News() {
  const navigate = useNavigate();

  // data
  const [rawList, setRawList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filter
  const [keyword, setKeyword] = useState("");
  const channel = "WEB";

  // paging (client-side sau khi đã merge)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr("");

      const [resAll, resStu] = await Promise.all([
        searchAnnouncements({
          keyword: keyword || undefined,
          target: "ALL",
          channel,
          pageIndex: 0,
          pageSize: 50, // lấy rộng rồi trang phía FE
        }),
        searchAnnouncements({
          keyword: keyword || undefined,
          target: "STUDENT",
          channel,
          pageIndex: 0,
          pageSize: 50,
        }),
      ]);

      const arrAll = _arr(resAll);
      const arrStu = _arr(resStu);

      // gộp & dedupe theo id
      const map = new Map();
      [...arrAll, ...arrStu].forEach((x) => x?.id && map.set(x.id, x));
      const merged = Array.from(map.values());

      // sort theo createdAt desc
      merged.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );

      setRawList(merged);
      setPageIndex(0); // reset trang khi tìm kiếm mới
    } catch (e) {
      console.error("News fetch error:", e);
      setErr("Không tải được dữ liệu. Hãy kiểm tra đăng nhập/CORS/endpoint.");
      setRawList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // tính toán paging
  const total = rawList.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(pageIndex, pages - 1);

  const pageItems = useMemo(() => {
    const start = safePageIndex * pageSize;
    return rawList.slice(start, start + pageSize);
  }, [rawList, safePageIndex, pageSize]);

  const goFirst = () => setPageIndex(0);
  const goPrev = () => setPageIndex((p) => Math.max(0, p - 1));
  const goNext = () => setPageIndex((p) => Math.min(pages - 1, p + 1));
  const goLast = () => setPageIndex(pages - 1);

  return (
    <div className="news-page">
      <h2>Tin tức & Thông báo</h2>

      <form className="news-search" onSubmit={doSearch}>
        <input
          type="text"
          placeholder="Tìm theo tiêu đề/nội dung…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="news-btn" type="submit">
          Tìm
        </button>
      </form>

      {loading ? (
        <div className="muted">Đang tải…</div>
      ) : err ? (
        <div className="warning">{err}</div>
      ) : total === 0 ? (
        <div className="muted">Không có thông báo phù hợp.</div>
      ) : (
        <>
          <div className="news-list">
            {pageItems.map((it) => (
              <div key={it.id} className="news-card">
                {it.imageUrl ? (
                  <img src={resolveImageUrl(it.imageUrl)} alt={it.title} />
                ) : (
                  <div className="news-thumb-fallback">No Image</div>
                )}
                <div className="news-content">
                  <h3 className="truncate-2">{it.title}</h3>
                  <p className="news-date">
                    {it.createdAt
                      ? new Date(it.createdAt).toLocaleString()
                      : "-"}
                  </p>
                  <p className="news-desc truncate-3">
                    {it.summary || it.content}
                  </p>
                  <button
                    className="news-btn"
                    onClick={() => navigate(`/news/${it.id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paging (compact) */}
<div className="news-paging compact">
  <button onClick={goFirst} disabled={safePageIndex === 0} className="icon-btn" title="Trang đầu">«</button>
  <button onClick={goPrev} disabled={safePageIndex === 0} className="icon-btn" title="Trang trước">‹</button>

  <span className="pg-now" title={`${total} thông báo`}>
    {safePageIndex + 1}/{pages}
  </span>

  <button onClick={goNext} disabled={safePageIndex >= pages - 1} className="icon-btn" title="Trang sau">›</button>
  <button onClick={goLast} disabled={safePageIndex >= pages - 1} className="icon-btn" title="Trang cuối">»</button>

  <select
    className="pg-size"
    value={pageSize}
    onChange={(e) => {
      setPageSize(Number(e.target.value));
      setPageIndex(0);
    }}
    title="Số bản ghi mỗi trang"
  >
    {[4, 6, 10, 20].map((s) => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
</div>

        </>
      )}
    </div>
  );
}
