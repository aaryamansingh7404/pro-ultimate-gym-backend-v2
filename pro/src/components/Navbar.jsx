import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle main nav
  const toggleNav = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setDropdownOpen(false);
    }
  };

  // Close dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       dropdownRef.current &&
  //       !dropdownRef.current.contains(event.target)
  //     ) {
  //       setDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <nav className="navbar">
      <div className="logo">
        <span className="pro">PRO</span>&nbsp;
        <span className="ultimate">ULTIMATE</span>&nbsp;
        <span className="gyms">GYMS</span>
      </div>

      <div className={`nav-links ${isOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
        <Link to="/services" onClick={() => setIsOpen(false)}>Services</Link>
        <Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
        <Link to="/signup" onClick={() => setIsOpen(false)}>SignUp</Link>
        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>

        <div
          className={`dropdown ${dropdownOpen ? "open" : ""}`}
          ref={dropdownRef}
        >
          <span
            className="dropdown-title"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            More ▼
          </span>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/userDashboard" onClick={() => { setIsOpen(false); setDropdownOpen(false); }}>Profile</Link>
              <Link to="/membership" onClick={() => { setIsOpen(false); setDropdownOpen(false); }}>Membership</Link>
              <Link to="/account" onClick={() => { setIsOpen(false); setDropdownOpen(false); }}>Account Statement</Link>
            </div>
          )}
        </div>
      </div>

      <div className="menu-icon" onClick={toggleNav}>
        ☰
      </div>
    </nav>
  );
};

export default Navbar;
