// src/pages/EditCustomerPage.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { API_BASE } from "../App";
import { CustomerContext } from "../contexts/CustomerContext";
import Spinner from "../components/Spinner";
import styles from "./EditCustomerPage.module.css";

function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCustomer } = useContext(CustomerContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/customers/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const customer = await response.json();
        // Pre-fill the form with the fetched customer's data.
        // Fields that might be missing get a fallback so inputs stay controlled.
        setForm({
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || "",
          company: customer.company || "",
          notes: customer.notes || "",
          status: customer.status,
          tags: customer.tags,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCustomer(id, form);
      navigate(`/app/customers/${id}`);
    } catch (err) {
      alert(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <Spinner size={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <p>Error: {error}</p>
        <Link to="/app/customers">Back to Customers</Link>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <Link to={`/app/customers/${id}`} className={styles.backLink}>
        ← Back to Customer
      </Link>
      <h2 className={styles.name}>Edit customer</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              className={styles.input}
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              className={styles.input}
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className={styles.input}
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="company">
              Company
            </label>
            <input
              id="company"
              name="company"
              className={styles.input}
              value={form.company}
              onChange={handleChange}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="notes">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className={styles.input}
              value={form.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className={styles.editField}>
            <label className={styles.sectionLabel} htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              className={styles.input}
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className={styles.editActions}>
          <button type="submit" className={styles.saveButton} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <Link to={`/app/customers/${id}`} className={styles.cancelButton}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EditCustomerPage;