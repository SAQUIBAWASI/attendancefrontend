import { useNavigate } from "react-router-dom";
// import "./LandingPage.css"; // for styling

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <h1 className="title">Welcome to Timely Attendance</h1>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2942/2942714.png"
        alt="Attendance illustration"
        className="landing-image"
      />

      <div className="button-container">
        <button className="role-button" onClick={() => navigate("/employee-login")}>
          Employee
        </button>
        <button className="role-button" onClick={() => navigate("/admin-login")}>
          Admin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;