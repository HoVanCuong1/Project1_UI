// VnPayReturn.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./VnPayReturn.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8088";

export default function VnPayReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [rawResp, setRawResp] = useState(null);

  const qs = location.search || "";

  useEffect(() => {
    let cancelled = false;
    const callIpn = async () => {
      if (!qs) {
        setResultMsg("Không có query string từ VNPAY.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setResultMsg("Gửi dữ liệu trả về tới server để xác thực...");

        // --- Option 1: GET trực tiếp tới backend IPN endpoint (như VNPay gọi) ---
        // const url = `${API_BASE}/webktx/vnpay/ipn${qs}`;
        // const res = await axios.get(url);

        // --- Option 2 (recommended): POST tới endpoint verify (if backend supports) ---
        // parse params to object and POST to verify endpoint
        const params = Object.fromEntries(new URLSearchParams(qs));
        const urlVerify = `${API_BASE}/webktx/vnpay/verify`; // backend should implement this optional endpoint
        // try POST verify first; if 404 -> fallback to GET ipn
        let res;
        try {
          res = await axios.post(urlVerify, params);
        } catch (err) {
          // if verify endpoint not available, fallback to GET ipn (older backend)
          if (err.response && err.response.status === 404) {
            const url = `${API_BASE}/webktx/vnpay/ipn${qs}`;
            res = await axios.get(url);
          } else {
            throw err;
          }
        }

        if (cancelled) return;
        setRawResp(res?.data ?? res);

        // treat success if backend returns 200 / resultCode 200 / "Ok"
        const data = res?.data;
        if (data === "Ok" || data?.resultCode === 200 || data?.status === "OK") {
          setOk(true);
          setResultMsg("Thanh toán đã được backend xác nhận thành công.");
        } else {
          setOk(false);
          setResultMsg(
            "Backend trả về kết quả khác. Kiểm tra network/console và logs phía server."
          );
        }
      } catch (err) {
        console.error("IPN/verify error:", err);
        setRawResp(err?.response?.data ?? String(err));
        setOk(false);
        setResultMsg(
          "Không thể gọi backend để xác nhận thanh toán. Kiểm tra CORS hoặc địa chỉ API_BASE."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    callIpn();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  const params = new URLSearchParams(qs);

  return (
    <div className="vnpay-return-wrap">
      <div className="vnpay-card">
        <h2>Trạng thái thanh toán VNPAY</h2>

        {loading ? (
          <div className="muted">Đang xử lý…</div>
        ) : (
          <>
            <div className={`status ${"00" ? "ok" : "fail"}`}>
              {"00" ? "Thanh toán thành công" : "Thanh toán / Xác nhận thất bại"}
            </div>

            <div className="vnpay-info">
              <h4>Thông tin trả về từ VNPAY</h4>
              <table>
                <tbody>
                  {Array.from(params.entries()).map(([k, v]) => (
                    <tr key={k}>
                      <td className="key">{k}</td>
                      <td className="val">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="actions">
              <button onClick={() => navigate("/payments")} className="btn">← Về trang Thanh toán</button>
              <button onClick={() => navigate("/payment-historys")} className="btn btn-primary">Xem lịch sử</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
