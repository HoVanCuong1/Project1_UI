import React from "react";
import "./App.css";
import Login from "./Login"; //--> chạy login
//import Interface from "./Interface"; //chạy Interface

function App() {
  return <Login />;
}

// function App() {
//   return (
//     <div className="container">
//       {/* Header */}
//       <header className="header">
//         <img src="/images/logo.png" alt="Logo" className="logo" />
//         <h1>TRANG THÔNG TIN SINH VIÊN</h1>
//       </header>

//       {/* Nội dung chính */}
//       <main className="main">
//         <div className="half left">
//           <div className="overlay">
//             <img src="/images/logo.png" alt="Logo" className="logo" />
//             <h2>Dành cho sinh viên chưa ở KTX</h2>
//             <button className="btn">ĐĂNG KÝ</button>
//           </div>
//         </div>
//         <div className="half right">
//           <div className="overlay">
//             <img src="/images/logo.png" alt="Logo" className="logo" />
//             <h2>Dành cho sinh viên đang ở KTX</h2>
//             <button className="btn">ĐĂNG NHẬP</button>
//           </div>
//         </div>
//       </main>
//       <MyButton></MyButton>
//     </div>
//   );
// }
// function MyButton() {
//   return <button>I'm a button</button>;
// }

export default App;
