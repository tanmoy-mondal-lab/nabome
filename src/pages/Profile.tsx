import Navbar from "../components/Navbar";

export default function Profile() {
  const user = JSON.parse(
    localStorage.getItem("nabome-user") ||
      "{}"
  );

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          padding: "80px 6%",
        }}
      >
        <h1
          style={{
            marginBottom: "40px",
          }}
        >
          My Profile
        </h1>

        <div
          style={{
            background: "#111",
            padding: "40px",
            borderRadius: "24px",
            maxWidth: "600px",
          }}
        >
          <p>
            <strong>Name:</strong>{" "}
            {user.name || "Customer"}
          </p>

          <br />

          <p>
            <strong>Email:</strong>{" "}
            {user.email || "Not Provided"}
          </p>

          <br />

          <button
            onClick={() => {
              localStorage.removeItem(
                "nabome-user"
              );

              window.location.href =
                "/";
            }}
            style={{
              padding: "14px 24px",
              border: "none",
              borderRadius: "12px",
              background: "#dc3545",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}