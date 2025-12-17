import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/AccountStatement.css";

const AccountStatement = ({ userEmail }) => {
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    if (!userEmail) return;

    fetch(`http://localhost:5001/api/membership-details?email=${userEmail}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch membership details");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setMemberships(data);
        else setMemberships([data]);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, [userEmail]);

  const generatePDF = (m) => {
    const doc = new jsPDF();
  
    //  Title
    doc.setFontSize(26);
    doc.setTextColor(255, 0, 0);
    doc.text("Pro", 85, 25);
    doc.setTextColor(0, 0, 0);
    doc.text("Ultimate Gym", 100, 25);
  
    //  Subheading
    doc.setFontSize(18);
    doc.text("Payment Slip", 105, 40, { align: "center" });
  
    //  User Info
    doc.setFontSize(12);
    let y = 55;
    doc.text(`Name: ${m.fullName}`, 20, y);
    doc.text(`Email: ${m.email}`, 20, y + 8);
    doc.text(`Phone: ${m.phone}`, 20, y + 16);
    doc.text(`Location: ${m.location}`, 20, y + 24);
  
    //Table for simple description
    autoTable(doc, {
      startY: y + 40,
      head: [["Description", "Details"]],
      body: [
        ["Trainer Name", m.selectedTrainer || "Not Selected"],
        ["Nutritionist Name", m.selectedNutritionist || "Not Selected"],
        ["Plan Type", m.membershipPlan],
        ["Total Amount", `₹${m.totalPrice || 0}`],
      ],
      theme: "grid",
      styles: { halign: "center", cellPadding: 6 },
      headStyles: { fillColor: [255, 0, 0], textColor: [255, 255, 255] },
      didDrawPage: (data) => {
        // Footer after table is drawn
        const finalY = data.cursor.y + 10; 
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for choosing Pro Ultimate Gym!", doc.internal.pageSize.getWidth()/2, finalY, { align: "center" });
      }
    });
  
    // Save PDF
    doc.save(`PaymentSlip_${m._id}.pdf`);
  };
  

  if (!userEmail)
    return <div className="error-message"> Please login first to view details.</div>;

  if (memberships.length === 0)
    return <div className="loading-message"> Fetching your memberships...</div>;

  return (
    <div className="account-statement-page">
  <div className="account-statement">
    <h2>Your Membership History</h2>

    {memberships.map((m, index) => (
      <div key={m._id} className="membership-card">
        <h3>Membership #{index + 1}</h3>
        <p><strong>Name:</strong> {m.fullName}</p>
        <p><strong>Email:</strong> {m.email}</p>
        <p><strong>Phone:</strong> {m.phone}</p>
        <p><strong>Location:</strong> {m.location}</p>
        <p><strong>Trainer Name:</strong> {m.selectedTrainer || "Not Selected"}</p>
        <p><strong>Nutritionist Name:</strong> {m.selectedNutritionist || "Not Selected"}</p>
        <p><strong>Plan Type:</strong> {m.membershipPlan}</p>
        <p><strong>Total Amount:</strong> ₹{m.totalPrice || 0}</p>

        <button onClick={() => generatePDF(m)}>Download Slip</button>
      </div>
    ))}
  </div>
</div>
  );
  
};

export default AccountStatement;
