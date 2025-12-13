import React, { useEffect, useState, useMemo } from "react";
import {
  getReportSummary,
  getReportDebtRooms,
  getReportOccupancy,
} from "../../../config/api";
import "./Reports.css";

// Import các thành phần của Recharts
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [summary, setSummary] = useState(null);
  const [debtRooms, setDebtRooms] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [loading, setLoading] = useState(false);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSummary, resDebt, resOccupancy] = await Promise.all([
        getReportSummary(selectedMonth),
        getReportDebtRooms(selectedMonth),
        getReportOccupancy(),
      ]);
      setSummary(resSummary);
      setDebtRooms(resDebt || []);
      setOccupancy(resOccupancy || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  // --- XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ ---

  // 1. Dữ liệu biểu đồ tròn (Tài chính)
  const pieData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Đã thu', value: summary.totalPaidAmount },
      { name: 'Còn nợ', value: summary.totalRemainAmount },
    ];
  }, [summary]);

  const COLORS = ['#1cc88a', '#e74a3b']; // Xanh (Đã thu), Đỏ (Nợ)

  // 2. Dữ liệu biểu đồ cột (Sinh viên theo Tòa)
  const barData = useMemo(() => {
    if (!occupancy.length) return [];
    
    // Gom nhóm phòng theo tòa (Block A, Block B...)
    const groups = {};
    occupancy.forEach(room => {
        if (!groups[room.dormName]) {
            groups[room.dormName] = { name: room.dormName, students: 0, capacity: 0 };
        }
        groups[room.dormName].students += room.occupants;
        groups[room.dormName].capacity += room.maxOccupants;
    });
    return Object.values(groups);
  }, [occupancy]);

  return (
    <div className="reports-container">
      <div className="container-fluid">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center page-header">
          <div>
            <h4 className="fw-bold text-dark mb-1">Dashboard Thống Kê</h4>
            <p className="text-muted mb-0 small">Tổng quan hoạt động ký túc xá</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-secondary small">Tháng báo cáo:</span>
            <input
              type="month"
              className="custom-date-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : (
          <>
            {/* PHẦN 1: CARDS (GIỮ NGUYÊN) */}
            {summary && (
              <div className="row g-3 mb-4">
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card primary">
                    <div>
                      <div className="stat-title">Tổng Sinh Viên</div>
                      <div className="stat-value">{summary.totalStudents}</div>
                    </div>
                    <div className="stat-desc"><i className="bi bi-building me-1"></i>{summary.totalRooms} Phòng</div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card success">
                    <div>
                      <div className="stat-title">Đã Thu</div>
                      <div className="stat-value text-success">{formatCurrency(summary.totalPaidAmount)}</div>
                    </div>
                    <div className="stat-desc">{summary.roomsWithInvoice} hóa đơn hoàn tất</div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card danger">
                    <div>
                      <div className="stat-title">Công Nợ</div>
                      <div className="stat-value text-danger">{formatCurrency(summary.totalRemainAmount)}</div>
                    </div>
                    <div className="stat-desc">{summary.unpaidRooms} phòng chưa đóng</div>
                  </div>
                </div>
                <div className="col-xl-3 col-md-6">
                  <div className="stat-card info">
                    <div>
                      <div className="stat-title">Doanh Thu Dự Kiến</div>
                      <div className="stat-value">{formatCurrency(summary.totalInvoiceAmount)}</div>
                    </div>
                    <div className="stat-desc">Tháng {selectedMonth}</div>
                  </div>
                </div>
              </div>
            )}

            {/* PHẦN 2: BẢNG + BIỂU ĐỒ (ĐIỀN VÀO CHỖ TRỐNG) */}
            <div className="row g-3">
              
              {/* CỘT TRÁI: DANH SÁCH NỢ (Chiếm 7 phần) */}
              <div className="col-lg-7">
                <div className="section-card h-100">
                  <div className="section-header d-flex justify-content-between align-items-center">
                    <h6 className="section-title text-danger">
                      <i className="bi bi-exclamation-octagon me-2"></i>
                      Chi tiết công nợ
                    </h6>
                  </div>
                  <div className="scroll-area">
                    <table className="table custom-table table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Phòng</th>
                          <th>Tòa</th>
                          <th className="text-end">Tổng tiền</th>
                          <th className="text-end">Còn nợ</th>
                          <th className="text-center">TT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debtRooms.length > 0 ? (
                          debtRooms.map((room, index) => (
                            <tr key={index}>
                              <td className="fw-bold">{room.roomName}</td>
                              <td>{room.dormName}</td>
                              <td className="text-end">{formatCurrency(room.totalAmount)}</td>
                              <td className="text-end text-danger fw-bold">{formatCurrency(room.debtAmount)}</td>
                              <td className="text-center">
                                <span className="custom-badge badge-unpaid">UNPAID</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center py-5 text-muted">
                               Không có dữ liệu nợ.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: BIỂU ĐỒ (Chiếm 5 phần - Lấp đầy chỗ trống khoanh đỏ) */}
              <div className="col-lg-5">
                <div className="d-flex flex-column gap-3 h-100">
                  
                  {/* CHART 1: TỶ LỆ THU CHI */}
                  <div className="section-card" style={{ minHeight: '300px' }}>
                    <div className="section-header">
                        <h6 className="section-title text-primary">Tỷ lệ thu hồi công nợ</h6>
                    </div>
                    <div className="card-body d-flex align-items-center justify-content-center" style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: THỐNG KÊ SINH VIÊN THEO TÒA */}
                  <div className="section-card flex-grow-1" style={{ minHeight: '300px' }}>
                     <div className="section-header">
                        <h6 className="section-title text-info">Mật độ sinh viên theo tòa</h6>
                    </div>
                    <div className="card-body pt-4" style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Legend />
                                <Bar dataKey="students" name="Đang ở" fill="#4e73df" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="capacity" name="Sức chứa" fill="#eaecf4" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;