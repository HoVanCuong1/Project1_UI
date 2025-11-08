import React, { useEffect, useState, useMemo } from "react";
import "./News.css";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncement, _obj } from "../../config/api";

/**
 * Chuẩn hoá URL ảnh:
 * - Nếu imageUrl đã là http(s) => dùng luôn
 * - Nếu imageUrl bắt đầu bằng "/" => prefix bằng REACT_APP_API_BASE (hoặc localhost:8088)
 * - Nếu BE trả null/empty => trả null
 */
function useResolvedImageUrl(imageUrl) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8088";
  return useMemo(() => {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (imageUrl.startsWith("/")) return `${API_BASE}${imageUrl}`;
    // fallback: coi như BE trả path tương đối không có "/" đầu
    return `${API_BASE}/${imageUrl}`;
  }, [imageUrl, API_BASE]);
}

export default function NewsDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setErr("");
        const res = await getAnnouncement(id);
        const data = _obj(res);
        setItem(data || null);
      } catch (e) {
        console.error(e);
        setErr("Không tải được thông báo.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const imgUrl = useResolvedImageUrl(item?.imageUrl);

  return (
    <div className="news-page">
      <div className="news-detail-wrap">
        <button className="news-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>

        {loading ? (
          <div className="muted">Đang tải…</div>
        ) : err ? (
          <div className="warning">{err}</div>
        ) : !item ? (
          <div className="muted">Không có dữ liệu.</div>
        ) : (
          <article className="news-detail cardish">
            <header className="news-detail-header">
              <h1 className="news-detail-title">{item.title}</h1>
              <div className="news-detail-meta">
                <span className="meta-chip">
                  🎯 Target: <b>{item.target}</b>
                </span>
                <span className="meta-chip">
                  📡 Channel: <b>{item.channel}</b>
                </span>
                <span className="meta-chip">
                  🕒{" "}
                  <b>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </b>
                </span>
              </div>
            </header>

            {imgUrl && (
              <div className="news-detail-hero">
                <img src={imgUrl} alt={item.title} />
              </div>
            )}

            {item.summary ? (
              <p className="news-detail-summary">{item.summary}</p>
            ) : null}

            <div className="news-detail-content">
              {/* Giữ xuống dòng, khoảng trắng tự nhiên */}
              <p className="preline">{item.content}</p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
