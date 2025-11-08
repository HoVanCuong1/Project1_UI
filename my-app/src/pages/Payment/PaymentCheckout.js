import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";
import { QRCodeCanvas } from "qrcode.react";
import { createMomoQR, _obj } from "../../config/api";

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice || null;

  const [loadingQR, setLoadingQR] = useState(false);
  const [errorQR, setErrorQR] = useState("");
  const [momo, setMomo] = useState(null); // dữ liệu trả về từ API MoMo

  const monthText = useMemo(
    () => (invoice?.month ? new Date(invoice.month).toISOString().slice(0, 7) : "-"),
    [invoice?.month]
  );

  // Gọi API tạo QR khi có invoice
  useEffect(() => {
    const fetchQR = async () => {
      if (!invoice?.id) return;
      try {
        setLoadingQR(true);
        setErrorQR("");
        const res = await createMomoQR(invoice.id);
        const data = _obj(res); // data = payload.data trong response bạn gửi mẫu
        setMomo(data || null);
      } catch (e) {
        console.error(e);
        setErrorQR("Không tạo được QR thanh toán. Vui lòng thử lại.");
        setMomo(null);
      } finally {
        setLoadingQR(false);
      }
    };
    fetchQR();
  }, [invoice?.id]);

  // Nội dung mã QR: ưu tiên payUrl (web), fallback sang qrCodeUrl (deeplink)
  const qrValue = useMemo(() => {
    if (!momo) return "";
    return momo.payUrl || momo.qrCodeUrl || "";
  }, [momo]);
  console.log(qrValue)

  return (
    <div className="payment-container">
      {!invoice ? (
        <>
          <h2>Thanh toán</h2>
          <div className="warning">Thiếu dữ liệu hóa đơn. Vui lòng quay lại.</div>
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </>
      ) : (
        <>
          <h2>Thanh toán hóa đơn</h2>

          <div className="card">
            <div className="header-row">
              <div>
                <div className="muted">Mã hóa đơn</div>
                <div className="big">{invoice.id}</div>
              </div>
              <div>
                <div className="muted">Phòng</div>
                <div className="big">{invoice.roomName}</div>
              </div>
              <div>
                <div className="muted">Tháng</div>
                <div className="big">{monthText}</div>
              </div>
              <div>
                <div className="muted">Tổng tiền</div>
                <div className="big">
                  {Number(invoice.totalAmount || 0).toLocaleString()} đ
                </div>
              </div>
            </div>

            <div className="qr-section">
              <h3>Quét mã QR để thanh toán MoMo</h3>

              {loadingQR && <div className="muted">Đang tạo QR…</div>}
              {errorQR && <div className="warning">{errorQR}</div>}

              {!loadingQR && !errorQR && momo && qrValue ? (
                <>
                  <div className="qr-box">
                    <QRCodeCanvas value={qrValue} size={220} includeMargin />
                  </div>

                  <div className="qr-meta">
                    <div>
                      <b>Amount:</b> {Number(momo.amount || 0).toLocaleString()} đ
                    </div>
                    <div>
                      <b>OrderId:</b> {momo.orderId}
                    </div>
                  </div>

                  <div className="qr-actions">
                    {momo.payUrl && (
                      <a
                        className="pay-btn"
                        href={momo.payUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Mở cổng thanh toán MoMo"
                      >
                        Mở cổng MoMo
                      </a>
                    )}
                    <button className="back-btn" onClick={() => navigate(-1)}>
                      ← Quay lại
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
