import React, { useEffect, useState, useMemo } from "react";
import "./ManagerAnnouncements.css";
import {
  getAnnouncementsPaged,
  searchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  uploadAnnouncementImage,
  _arr,
  _obj,
  getMyInfo,
} from "../../../config/api";

const TARGETS = ["ALL", "STUDENT", "MANAGER"];
const CHANNELS = ["WEB", "EMAIL", "SMS", "APP"];

function resolveImage(url) {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8088";
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}


export default function ManagerAnnouncements() {
  // list + filter/paging
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, pages: 1, total: 0 });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState("");
  const [channel, setChannel] = useState("WEB"); // mặc định WEB

  // form (create/update)
  const blankForm = {
    id: null,
    title: "",
    summary: "",
    content: "",
    target: "STUDENT",
    channel: "WEB",
    createdById: "", // lấy từ getMyInfo khi submit
  };
  const [form, setForm] = useState(blankForm);
  const [uploading, setUploading] = useState(false);

  // lấy createdById để sẵn (nếu muốn)
  useEffect(() => {
    (async () => {
      try {
        const meRes = await getMyInfo();
        const me = _obj(meRes);
        if (me?.id) {
          setForm((f) => ({ ...f, createdById: me.id }));
        }
      } catch {}
    })();
  }, []);

  // --- FETCH LIST (đã fix bóc dữ liệu) ---
  const fetchPaged = async (idx = pageIndex, size = pageSize) => {
    try {
      setLoading(true);
      let res;
      if (keyword || target || channel) {
        res = await searchAnnouncements({
          keyword: keyword || undefined,
          target: target || undefined,
          channel: channel || undefined,
          pageIndex: idx,
          pageSize: size,
        });
      } else {
        res = await getAnnouncementsPaged(idx, size);
      }

      // Bóc payload thống nhất qua _obj/_arr
      const payload = _obj(res);
      const rows = _arr(payload?.result);
      const m = payload?.meta || { page: 1, pageSize: size, pages: 1, total: rows.length || 0 };

      setList(rows);
      setMeta(m);
    } catch (e) {
      console.error(e);
      setList([]);
      setMeta({ page: 1, pageSize: pageSize, pages: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaged(0, pageSize);
    setPageIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const doSearch = () => {
    fetchPaged(0, pageSize);
    setPageIndex(0);
  };

  const clearFilter = () => {
    setKeyword("");
    setTarget("");
    setChannel("WEB");
    fetchPaged(0, pageSize);
    setPageIndex(0);
  };

  const handlePick = (item) => {
    setForm({
      id: item.id,
      title: item.title || "",
      summary: item.summary || "",
      content: item.content || "",
      target: item.target || "STUDENT",
      channel: item.channel || "WEB",
      createdById: form.createdById || "", // giữ id của mình
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      await deleteAnnouncement(id);
      if (form.id === id) setForm(blankForm);
      await fetchPaged(pageIndex, pageSize);
      alert("Đã xóa.");
    } catch (e) {
      console.error(e);
      alert("Xóa thất bại.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!form.title?.trim()) {
        alert("Vui lòng nhập tiêu đề.");
        return;
      }
      if (!form.content?.trim()) {
        alert("Vui lòng nhập nội dung.");
        return;
      }

      if (form.id) {
        // update
        const body = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          target: form.target,
          channel: form.channel,
        };
        await updateAnnouncement(form.id, body);
        alert("Cập nhật thành công.");
      } else {
        // create
        const payload = {
          title: form.title,
          summary: form.summary,
          content: form.content,
          target: form.target,
          channel: form.channel,
          createdById: form.createdById || undefined,
        };
        const res = await createAnnouncement(payload);
        const data = _obj(res);
        if (data?.id) {
          // 👉 Nếu bạn MUỐN form hiển thị lại bản vừa tạo để có thể upload ảnh ngay:
          setForm((f) => ({ ...f, id: data.id }));
          // Nếu bạn muốn clear form sau khi tạo, dùng: setForm(blankForm);
        }
        alert("Tạo thông báo thành công.");
      }

      // 👉 chỉ khi bấm Create/Update mới refresh list (đúng yêu cầu)
      await fetchPaged(pageIndex, pageSize);
    } catch (e) {
      console.error(e);
      alert("Lưu thất bại.");
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!form.id) {
      alert("Hãy lưu thông báo trước, rồi mới upload ảnh.");
      e.target.value = "";
      return;
    }
    try {
      setUploading(true);
      await uploadAnnouncementImage(form.id, file);
      alert("Upload ảnh thành công.");
      await fetchPaged(pageIndex, pageSize);
    } catch (err) {
      console.error(err);
      alert("Upload thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handlePaging = (next) => {
    if (next < 0) return;
    if (meta?.pages && next > meta.pages - 1) return;
    setPageIndex(next);
    fetchPaged(next, pageSize);
  };

  return (
    <div className="ma-wrap">
      <h2>Quản lý thông báo</h2>

      {/* FORM */}
      <div className="ma-form card">
        <h3>{form.id ? "Sửa thông báo" : "Tạo thông báo"}</h3>
        <form onSubmit={handleSubmit} className="ma-grid">
          <label>
            Tiêu đề
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Nhập tiêu đề…"
            />
          </label>

          <label>
            Tóm tắt
            <input
              type="text"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Tóm tắt ngắn…"
            />
          </label>

          <label className="full">
            Nội dung
            <textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Nội dung chi tiết…"
            />
          </label>

          <label>
            Target
            <select
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
            >
              {TARGETS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Channel
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="full ma-actions">
            <button className="btn primary" type="submit">
              {form.id ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => setForm(blankForm)}
              title="Xoá dữ liệu trên form"
            >
              Clear form
            </button>
            <label className="btn upload" title="Upload ảnh cho bản ghi đang mở">
              {uploading ? "Đang upload..." : "Upload ảnh"}
              <input type="file" accept="image/*" onChange={handleUpload} hidden />
            </label>
          </div>
        </form>
      </div>

      {/* FILTER + LIST */}
      <div className="ma-filter card">
        <h3>Danh sách</h3>

        <div className="row">
          <input
            type="text"
            placeholder="Từ khóa"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">Target: ALL/STUDENT/MANAGER</option>
            {TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="btn" onClick={doSearch}>
            Tìm
          </button>
          <button className="btn" onClick={clearFilter}>
            Reset
          </button>
        </div>

        {loading ? (
          <div className="muted">Đang tải…</div>
        ) : (
          <>
            <table className="ma-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Target</th>
                  <th>Channel</th>
                  <th>Thời gian</th>
                  <th>Ảnh</th>
                  <th className="right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((it) => {
                  const imgSrc = resolveImage(it.imageUrl);
                  return (
                    <tr key={it.id}>
                      <td>
                        <div
                          className="title"
                          onClick={() => handlePick(it)}
                          title="Chọn để sửa"
                        >
                          {it.title}
                        </div>
                        <div className="sub">{it.summary}</div>
                      </td>
                      <td>{it.target}</td>
                      <td>{it.channel}</td>
                      <td>
                        {it.createdAt
                          ? new Date(it.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        {imgSrc ? (
                          <img className="thumb" src={imgSrc} alt="" />
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                      <td className="right">
                        <button className="btn" onClick={() => handlePick(it)}>
                          Sửa
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete(it.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      Không có dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Paging gọn */}
            <div className="paging slim">
              <div className="paging-actions">
                <button
                  className="btn"
                  onClick={() => handlePaging(0)}
                  disabled={pageIndex === 0}
                  title="Trang đầu"
                >
                  «
                </button>
                <button
                  className="btn"
                  onClick={() => handlePaging(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  title="Trang trước"
                >
                  ‹
                </button>
                <span className="page-now">
                  {meta?.page ?? pageIndex + 1}/{meta?.pages ?? 1}
                </span>
                <button
                  className="btn"
                  onClick={() => handlePaging(pageIndex + 1)}
                  disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
                  title="Trang sau"
                >
                  ›
                </button>
                <button
                  className="btn"
                  onClick={() =>
                    handlePaging((meta?.pages ?? 1) - 1)
                  }
                  disabled={meta?.pages ? pageIndex >= meta.pages - 1 : true}
                  title="Trang cuối"
                >
                  »
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  title="Kích thước trang"
                >
                  {[5, 10, 20, 50].map((s) => (
                    <option key={s} value={s}>
                      {s}/trang
                    </option>
                  ))}
                </select>
              </div>
              <div className="muted total">
                Tổng: {meta?.total ?? 0}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
