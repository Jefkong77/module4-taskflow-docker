import { useState, useEffect, useContext } from "react";
import { CustomerContext } from "../contexts/CustomerContext";
import { API_BASE } from "../App";
import Spinner from "./Spinner";
import styles from "./CustomerDetail.module.css";

function CustomerDetail({ selectedId }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!selectedId) return;

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate network delay to show the loading spinner
        await new Promise((resolve) => setTimeout(resolve, 300));
        const response = await fetch(`${API_BASE}/customers/${selectedId}`);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [selectedId]);

  const handleEditClick = () => setIsEditing(true);

  const handleDone = (updates) => {
    if (updates) {
      setCustomer((prev) => ({ ...prev, ...updates }));
    }
    setIsEditing(false);
  };

  if (!selectedId) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Select a customer to view details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Error: {error}</p>
      </div>
    );
  }

  if (loading || !customer) {
    return (
      <div className={styles.panel}>
        <Spinner size={8} />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {isEditing ? (
        <CustomerEditForm customer={customer} onDone={handleDone} />
      ) : (
        <CustomerView customer={customer} onEditClick={handleEditClick} />
      )}
    </div>
  );
}

function CustomerView({ customer, onEditClick }) {
  return (
    <>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.name}>
            {customer.firstName} {customer.lastName}
          </h2>
          {customer.company && (
            <p className={styles.company}>{customer.company}</p>
          )}
        </div>
        <button className={styles.editButton} onClick={onEditClick}>
          Edit
        </button>
      </div>

      <div>
        <p className={styles.contactRow}>{customer.email}</p>
        {customer.phone && (
          <p className={styles.contactRow}>{customer.phone}</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Status and tags</p>
        <div className={styles.tags}>
          <span
            className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}
          >
            {customer.status}
          </span>
          {customer.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Notes</p>
        {customer.notes ? (
          <p className={styles.notes}>{customer.notes}</p>
        ) : (
          <p className={styles.notesEmpty}>No notes yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Customer since</p>
        <p className={styles.contactRow}>{customer.createdAt}</p>
      </div>
    </>
  );
}

function CustomerEditForm({ customer, onDone }) {
  const { updateCustomer } = useContext(CustomerContext);
  const [editForm, setEditForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone || "",
    company: customer.company || "",
    notes: customer.notes || "",
    status: customer.status,
    tags: customer.tags,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCustomer(customer.id, editForm);
      onDone(editForm);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className={styles.name}>Edit customer</h2>

      <div className={styles.section}>
        <div className={styles.editField}>
          <label className={styles.sectionLabel} htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            className={styles.input}
            value={editForm.firstName}
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
            value={editForm.lastName}
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
            value={editForm.email}
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
            value={editForm.phone}
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
            value={editForm.company}
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
            value={editForm.notes}
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
            value={editForm.status}
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
        <button
          type="button"
          className={styles.cancelButton}
          onClick={() => onDone(null)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CustomerDetail;
