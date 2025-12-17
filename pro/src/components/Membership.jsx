import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/membership.css";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51SEpaJRvOlgX1Pb9VznPZlwjf2k5tMvZ3LZ2yBe4r04JvGNH2bImETBUVt07WYpxc9fLfDsuA1JqYFEeLZZ55bly00uKZ2mBEP");

const trainers = [
  { name: "Rohit Sharma", expertIn: "Weight Training" },
  { name: "Neha Singh", expertIn: "Yoga & Flexibility" },
  { name: "Amit Verma", expertIn: "Cardio & Endurance" },
];

const nutritionists = [
  { name: "Simran Kaur", expertIn: "Nutrition & Diet" },
  { name: "Rahul Sharma", expertIn: "Meal Planning & Supplements" },
];

const membershipPrices = { Basic: 6000, Pro: 10000, Premium: 20000 };

export default function MembershipPlan() {
  const location = useLocation();
  const selectedPlan = location.state?.plan || "";
  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    location: "",
    membershipPlan: selectedPlan,
    startDate: "",
    selectedTrainer: "",
    selectedNutritionist: "",
  });

  const [errors, setErrors] = useState({});
  const [showStripe, setShowStripe] = useState(false);
  const [stripeAmount, setStripeAmount] = useState(0);

  useEffect(() => {
    if (selectedPlan) setFormData((prev) => ({ ...prev, membershipPlan: selectedPlan }));
    window.scrollTo(0, 0);
  }, [selectedPlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.membershipPlan) newErrors.membershipPlan = "Membership plan is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if ((formData.membershipPlan === "Pro" || formData.membershipPlan === "Premium") && !formData.selectedTrainer)
      newErrors.selectedTrainer = "Please select a trainer";
    if (formData.membershipPlan === "Premium" && !formData.selectedNutritionist)
      newErrors.selectedNutritionist = "Please select a nutritionist";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const CheckoutForm = ({ totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [status, setStatus] = useState("");

    const handlePayment = async () => {
      setStatus("Processing payment...");
      try {
        const res = await fetch("http://localhost:5001/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount * 100 }),
        });
        const { clientSecret } = await res.json();

        const card = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });

        if (result.error) {
          setStatus("Payment failed: " + result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
          setStatus("Payment Successful! ID: " + result.paymentIntent.id);

          const dataToSend = {
            ...formData,
            totalPrice: totalAmount,
            paymentId: result.paymentIntent.id,
            purchasedBy: loggedInUser.email,
          };

          const res = await fetch("http://localhost:5001/api/membership", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToSend),
          });
          
          const responseData = await res.json();
          console.log("Backend Response:", responseData);

          alert("Membership registered & payment successful!");
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            gender: "",
            dob: "",
            location: "",
            membershipPlan: "",
            startDate: "",
            selectedTrainer: "",
            selectedNutritionist: "",
          });
          setShowStripe(false);
        }
      } catch (err) {
        console.error(err);
        setStatus("Error processing payment.");
      }
    };

    return (
      <div className="stripe-modal">
        <div className="stripe-card">
          <h3>Card Payment</h3>
          <CardElement options={{ hidePostalCode: true }} />
          <button className="pay-btn" type="button" onClick={handlePayment} disabled={!stripe}>
            Pay ₹{totalAmount}
          </button>
          {status && <div className="payment-status">{status}</div>}
        </div>
      </div>
    );
  };

  const membershipCost = membershipPrices[formData.membershipPlan] || 0;
  const showTrainerOption = formData.membershipPlan === "Pro" || formData.membershipPlan === "Premium";
  const showNutritionistOption = formData.membershipPlan === "Premium";

  return (
    <div className="form-container">
      <h2 className="form-title">
        <span className="gym">Gym</span> <span className="membership">Membership</span>
      </h2>
      <form>
        {/* Form Fields */}
        <label>Full Name *</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
        {errors.fullName && <div className="error">{errors.fullName}</div>}

        <label>Email *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
        {errors.email && <div className="error">{errors.email}</div>}

        <label>Phone *</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        {errors.phone && <div className="error">{errors.phone}</div>}

        <label>Date of Birth *</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
        {errors.dob && <div className="error">{errors.dob}</div>}

        <label>Gender *</label>
        <div className="radio-group">
          {["Male", "Female", "Other"].map((g) => (
            <label key={g}>
              <input type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleChange} /> {g}
            </label>
          ))}
        </div>
        {errors.gender && <div className="error">{errors.gender}</div>}

        <label>Gym Location *</label>
        <select name="location" value={formData.location} onChange={handleChange}>
          <option value="">-- Select Location --</option>
          <option value="Ambala City">Ambala City</option>
          <option value="Mohali">Mohali</option>
          <option value="Delhi">Delhi</option>
          <option value="Patna">Patna</option>
        </select>
        {errors.location && <div className="error">{errors.location}</div>}

        <label>Membership Plan *</label>
        <select name="membershipPlan" value={formData.membershipPlan} onChange={handleChange}>
          <option value="">-- Select Plan --</option>
          <option value="Basic">Basic - ₹6,000 (3 months)</option>
          <option value="Pro">Pro - ₹10,000 (6 months)</option>
          <option value="Premium">Premium - ₹20,000 (12 months)</option>
        </select>
        {errors.membershipPlan && <div className="error">{errors.membershipPlan}</div>}

        <label>Start Date *</label>
        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
        {errors.startDate && <div className="error">{errors.startDate}</div>}

        {/* Trainer & Nutritionist */}
        {showTrainerOption && (
          <div className="trainer-section">
            <h3>Choose Trainer *</h3>
            {trainers.map((t) => (
              <div key={t.name} className={`trainer-card ${formData.selectedTrainer === t.name ? "selected" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, selectedTrainer: t.name }))}>
                <div className="trainer-info">
                  <div className="trainer-name">{t.name}</div>
                  <div className="trainer-expert">{t.expertIn}</div>
                </div>
                {formData.selectedTrainer === t.name && <div className="tick-mark">✔</div>}
              </div>
            ))}
            {errors.selectedTrainer && <div className="error">{errors.selectedTrainer}</div>}
          </div>
        )}

        {showNutritionistOption && (
          <div className="trainer-section">
            <h3>Choose Nutritionist *</h3>
            {nutritionists.map((n) => (
              <div key={n.name} className={`trainer-card ${formData.selectedNutritionist === n.name ? "selected" : ""}`} onClick={() => setFormData((prev) => ({ ...prev, selectedNutritionist: n.name }))}>
                <div className="trainer-info">
                  <div className="trainer-name">{n.name}</div>
                  <div className="trainer-expert">{n.expertIn}</div>
                </div>
                {formData.selectedNutritionist === n.name && <div className="tick-mark">✔</div>}
              </div>
            ))}
            {errors.selectedNutritionist && <div className="error">{errors.selectedNutritionist}</div>}
          </div>
        )}

        <div className="total-price">
          <h3>Total Payable: ₹{membershipCost}</h3>
        </div>

        <button type="button" className="pay-btn" onClick={(e) => { e.preventDefault(); if (validate()) { setStripeAmount(membershipCost); setShowStripe(true); } }}>
          Pay ₹{membershipCost}
        </button>
      </form>

      {showStripe && <Elements stripe={stripePromise}><CheckoutForm totalAmount={stripeAmount} /></Elements>}
    </div>
  );
}