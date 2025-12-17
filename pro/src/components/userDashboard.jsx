import React, { useEffect, useState, useRef } from "react";
import "../styles/UserDashboard.css";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // Modal state

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:5001/api/user-dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to fetch");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUserData(data.user);
        setMembershipData(data.membership);
        setFormData({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          state: data.user.state || "",
          city: data.user.city || "",
        });

        if (data.user.profilePhoto) {
          const photoPath = data.user.profilePhoto.startsWith(".")
            ? data.user.profilePhoto.slice(1)
            : data.user.profilePhoto;
          setPreview(`http://localhost:5001${photoPath}`);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) {
      alert("Only JPG/PNG allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Max file size 2MB");
      return;
    }
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedImage) return alert("Choose an image first");
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("photo", selectedImage);

      const res = await fetch("http://localhost:5001/api/upload-profile-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await res.json();
      setUploading(false);
      if (!res.ok) {
        alert(data.message || "Upload failed");
        return;
      }

      const profilePhoto = data.profilePhoto;
      const photoPath = profilePhoto.startsWith(".") ? profilePhoto.slice(1) : profilePhoto;
      const fullUrl = `http://localhost:5001${photoPath}`;
      setUserData((prev) => ({ ...prev, profilePhoto: fullUrl }));
      setPreview(fullUrl);
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      alert("Profile photo updated!");
    } catch (err) {
      setUploading(false);
      console.error("Upload Error:", err);
      alert("Upload failed");
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/remove-profile-photo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to remove photo");
        return;
      }
      setUserData((prev) => ({ ...prev, profilePhoto: null }));
      setPreview(null);
      setModalOpen(false);
      alert("Profile photo removed!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove photo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    setMembershipData(null);
    window.location.href = "/";
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Update failed");
        return;
      }

      const data = await res.json();
      alert("Profile updated successfully");
      setUserData(data.user);
      setEditing(false);
    } catch (err) {
      alert("Something went wrong!");
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="profile-section">
          <div className="profile-icon" style={{ position: "relative" }}>
            {preview ? (
              <img
                src={preview}
                alt="profile"
                className="profile-photo"
                onClick={() => userData.profilePhoto && setModalOpen(true)}
              />
            ) : (
              <svg viewBox="0 0 24 24" className="default-avatar">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
              </svg>
            )}
            <button
              className="camera-btn"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              title="Upload profile photo"
            >
              📷
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {/* Modal */}
          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <img src={preview} alt="Large profile" className="modal-image" />
                <button className="logout-btn" onClick={handleRemovePhoto}>
                  Remove Image
                </button>
                <button className="logout-btn" onClick={() => setModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Upload controls */}
          {selectedImage && (
            <div style={{ marginBottom: 12 }}>
              <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              <button
                style={{ marginLeft: 8 }}
                className="logout-btn"
                onClick={() => {
                  setSelectedImage(null);
                  setPreview(userData.profilePhoto || null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Profile form/details */}
          {editing ? (
            <>
              {["firstName", "lastName", "email", "phone", "address", "city", "state"].map((field) => (
                <div className="info-row" key={field}>
                  <div className="label">{field.replace(/^\w/, (c) => c.toUpperCase())}:</div>
                  <input type="text" name={field} value={formData[field]} onChange={handleChange} />
                </div>
              ))}
              <button className="logout-btn" onClick={handleSubmit}>Save Changes</button>
            </>
          ) : (
            <>
              <div className="info-row">
                <div className="label">Name:</div>
                <div className="value">{userData.firstName} {userData.lastName}</div>
              </div>
              <div className="info-row">
                <div className="label">Email:</div>
                <div className="value">{userData.email}</div>
              </div>
              <div className="info-row">
                <div className="label">Phone:</div>
                <div className="value">{userData.phone}</div>
              </div>
              <div className="info-row">
                <div className="label">Address:</div>
                <div className="value">{userData.address}, {userData.city}, {userData.state}</div>
              </div>
            </>
          )}

          {membershipData && (
            <>
              <div className="info-row">
                <div className="label">Plan:</div>
                <div className="value">{membershipData.membershipPlan}</div>
              </div>
              <div className="info-row">
                <div className="label">Start Date:</div>
                <div className="value">{membershipData.startDate}</div>
              </div>
              {membershipData.selectedTrainer && (
                <div className="info-row">
                  <div className="label">Selected Trainer:</div>
                  <div className="value">{membershipData.selectedTrainer}</div>
                </div>
              )}
              {membershipData.selectedNutritionist && (
                <div className="info-row">
                  <div className="label">Selected Nutritionist:</div>
                  <div className="value">{membershipData.selectedNutritionist}</div>
                </div>
              )}
              <div className="info-row">
                <div className="label">Total Price:</div>
                <div className="value">₹{membershipData.totalPrice}</div>
              </div>
            </>
          )}
        </div>

        <button className="main-logout-btn" onClick={handleLogout}>
  Logout
</button>
      </div>
    </div>
  );
};

export default UserDashboard;
