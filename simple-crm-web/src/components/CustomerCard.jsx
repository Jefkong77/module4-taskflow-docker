import { useContext } from "react";
import { Mail, Phone } from "lucide-react";
import { CustomerContext } from "../contexts/CustomerContext";
import styles from "./CustomerCard.module.css";

function initials(firstName, lastName) {
  return (firstName[0] + lastName[0]).toUpperCase();
}
function CustomerCard({ customer, onSelect }) {
  const { deleteCustomer } = useContext(CustomerContext);
  const { firstName, lastName, email, phone, status, tags } = customer;

  return (
    <div
  className={styles.card}
  onClick={() => onSelect(customer.id)}
    >
      <div className={styles.header}>
        <div className={styles.avatar}>{initials(firstName, lastName)}</div>
        <div className={styles.nameBlock}>
          <p className={styles.name}>
            {firstName} {lastName}
          </p>
        </div>
        <span
          className={`${styles.badge} ${status === "active" ? styles.badgeActive : styles.badgeInactive}`}
        >
          {status}
        </span>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <Mail size={14} />
          {email}
        </div>
        <div className={styles.metaRow}>
          <Phone size={14} />
          {phone}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            deleteCustomer(customer.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default CustomerCard;
