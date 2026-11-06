// src/pages/NewCustomerPage.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import { CustomerContext } from "../contexts/CustomerContext";

const ALL_TAGS = ["VIP", "Lead", "Referral"];

function NewCustomerPage() {
  const { addCustomer, submitting } = useContext(CustomerContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active",
    tags: [],
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTagToggle = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCustomer = await addCustomer({
      ...form,
      company: "",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    navigate(`/app/customers/${newCustomer.id}`);
  };

  return (
    <div>
      <Link to="/app/customers" className="back-link">
        ← Back to Customers
      </Link>
      <h1>Add New Customer</h1>

      <form onSubmit={handleSubmit} className="add-customer-form">
        <div className="form-field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            name="firstName"
            placeholder="e.g. Sarah"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            name="lastName"
            placeholder="e.g. Chen"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. sarah.chen@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            placeholder="e.g. +65 9123 4567"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="form-field">
          <label>Tags</label>
          <div className="tag-options">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`tag-toggle${form.tags.includes(tag) ? " tag-toggle-active" : ""}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={submitting}>
          {submitting ? "Adding..." : "Add Customer"}
        </button>
      </form>
    </div>
  );
}

export default NewCustomerPage;