import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Payment.css";
import {
  getLatestUnpaidInvoiceByRoom,
  getMyInfo,
  getStudentById,
  _obj,
} from "../../config/api";

/**
 * Lấy roomId theo thứ tự ưu tiên:
 * - /payments/:roomId
 * - /payments?roomId=...
 * - location.state?.roomId
 * - getMyInfo() -> studentId -> getStudentById(studentId).roomId
 */
function useResolvedRoomId() {
  const { roomId: roomIdParam } = useParams();
  const location = useLocation();

  const [resolvedRoomId, setResolvedRoomId] = useState("");
  const [loadingRoomId, setLoadingRoomId] = useState(false);
  const [roomIdError, setRoomIdError] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const roomIdQuery = query.get("roomId");
    const roomIdState = location.state?.roomId;

    // 1/2/3: nếu đã có roomId từ URL/query/state thì dùng ngay
    const immediate = roomIdParam || roomIdQuery || roomIdState;
    if (immediate) {
      setResolvedRoomId(immediate);
      setRoomIdError("");
      return;
    }

    // 4: fallback — tự tìm roomId theo user đang đăng nhập
    const fetchRoomFromMe = async () => {
      try {
        setLoadingRoomId(true);
        setRoomIdError("");
        // Lấy myInfo -> studentId
        const meRes = await getMyInfo();
        const me = _obj(meRes);
        const studentId = me?.studentId;
        if (!studentId) {
          setRoomIdError("Không tìm được studentId từ tài khoản hiện tại.");
          setResolvedRoomId("");
          return;
        }
        // Lấy student -> roomId
        const stuRes = await getStudentById(studentId);
        const stu = _obj(stuRes);
        const rid = stu?.roomId;
        if (!rid) {
          setRoomIdError("Tài khoản chưa có phòng gán. Vui lòng liên hệ quản lý KTX.");
          setResolvedRoomId("");
          return;
        }
        setResolvedRoomId(rid);
      } catch (e) {
        console.error(e);
        setRoomIdError("Không xác định được phòng của bạn. Vui lòng thử lại.");
        setResolvedRoomId("");
      } finally {
        setLoadingRoomId(false);
      }
    };

    fetchRoomFromMe();
  }, [roomIdParam, location.search, location.state]);

  return { resolvedRoomId, loadingRoomId, roomIdError };
}

export default function Payment() {
  const navigate = useNavigate();
  const { resolvedRoomId, loadingRoomId, roomIdError } = useResolvedRoomId();

  const [invoice, setInvoice] = useState(null);
  const [loadingInv, setLoadingInv] = useState(false);
  const [errInv, setErrInv] = useState("");

  // Tải hóa đơn chưa thanh toán mới nhất của phòng
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!resolvedRoomId) return;
      try {
        setLoadingInv(true);
        setErrInv("");
        const res = await getLatestUnpaidInvoiceByRoom(resolvedRoomId);
        const data = _obj(res);
        setInvoice(data || null);
      } catch (e) {
        console.error(e);
        setErrInv("Không tải được hóa đơn chưa thanh toán của phòng.");
        setInvoice(null);
      } finally {
        setLoadingInv(false);
      }
    };
    fetchInvoice();
  }, [resolvedRoomId]);

  const lines = useMemo(() => {
    if (!invoice) return [];
    const base = invoice.roomFee
      ? [
          {
            key: "room",
            name: "Tiền phòng",
            info: "Giá gốc phòng",
            amount: Number(invoice.roomFee || 0),
          },
        ]
      : [];
    const details = Array.isArray(invoice.details) ? invoice.details : [];
    const serviceLines = details.map((d) => ({
      key: d.detailId,
      name: d.serviceName,
      info:
        d.unitPrice != null
          ? `${Number(d.quantity).toLocaleString()} ${d.unit} × ${Number(d.unitPrice).toLocaleString()}`
          : `${Number(d.quantity).toLocaleString()} ${d.unit}`,
      amount: Number(d.totalAmount || 0),
      description: d.description || null,
    }));
    return [...base, ...serviceLines];
  }, [invoice]);

  const statusClass = (s) =>
    !s ? "" : s === "PAID" ? "badge paid" : s === "UNPAID" ? "badge unpaid" : "badge";

  const handleGoCheckout = () => {
    if (!invoice) return;
    navigate("/payments/checkout", { state: { invoice } });
  };

  return (
    <div className="payment-container">
      <h2>Hóa đơn phòng ký túc xá</h2>

      {/* Thông báo & trạng thái xác định roomId */}
      {loadingRoomId && (
        <div className="card">
          <div className="muted">Đang xác định phòng từ tài khoản đăng nhập…</div>
        </div>
      )}

      {roomIdError && (
        <div className="warning">
          {roomIdError} Bạn có thể mở đường dẫn:
          <code> /payments?roomId=RM-XXXX </code> để chỉ định thủ công.
        </div>
      )}

      {!loadingRoomId && !resolvedRoomId && !roomIdError && (
        <div className="warning">
          Thiếu <b>roomId</b>. Vui lòng truy cập theo:
          <code> /payments?roomId=RM-XXXX </code> hoặc đăng nhập tài khoản sinh viên đã có phòng.
        </div>
      )}

      {resolvedRoomId && (
        <div className="card">
          <div className="header-row">
            <div>
              <div className="muted">Mã phòng</div>
              <div className="big">{invoice?.roomId || resolvedRoomId}</div>
            </div>
            <div>
              <div className="muted">Phòng</div>
              <div className="big">{invoice?.roomName || "-"}</div>
            </div>
            <div>
              <div className="muted">Tháng</div>
              <div className="big">
                {invoice?.month ? new Date(invoice.month).toISOString().slice(0, 7) : "-"}
              </div>
            </div>
            <div>
              <div className="muted">Trạng thái</div>
              <div className={statusClass(invoice?.status)}>{invoice?.status || "-"}</div>
            </div>
          </div>

          {loadingInv && <p className="muted">Đang tải hóa đơn…</p>}
          {errInv && <p className="warning">{errInv}</p>}

          {!loadingInv && !errInv && invoice && (
            <>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Khoản mục</th>
                    <th>Thông tin</th>
                    <th className="right">Thành tiền (VNĐ)</th>
                </tr>
                </thead>
                <tbody>
                  {lines.map((ln) => (
                    <tr key={ln.key}>
                      <td>
                        <b>{ln.name}</b>
                        {ln.description ? (
                          <div className="desc">Ghi chú: {ln.description}</div>
                        ) : null}
                      </td>
                      <td>{ln.info}</td>
                      <td className="right">{ln.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="total">
                    <td colSpan={2} className="right">
                      <b>TỔNG CỘNG</b>
                    </td>
                    <td className="right">
                      <b>{Number(invoice.totalAmount || 0).toLocaleString()}</b>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="payment-summary">
                <div>
                  Ngày lập:{" "}
                  <b>{invoice?.createdAt ? String(invoice.createdAt) : "-"}</b>
                </div>
                <div className="actions">
                  <button
                    className="pay-btn"
                    disabled={invoice?.status === "PAID"}
                    onClick={handleGoCheckout}
                    title={invoice?.status === "PAID" ? "Hóa đơn đã thanh toán" : "Thanh toán"}
                  >
                    Thanh toán
                  </button>
                </div>
              </div>
            </>
          )}

          {!loadingInv && !errInv && !invoice && (
            <div className="muted">
              Không có hóa đơn <b>UNPAID</b> mới nhất cho phòng này.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
