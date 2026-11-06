// src/pages/DashboardPage.jsx
import { useContext } from "react";
import { CustomerContext } from "../contexts/CustomerContext";
import styles from "./DashboardPage.module.css";

function DashboardPage() {
  const { customers } = useContext(CustomerContext);

  const activeCount = customers.filter((c) => c.status === "active").length;
  const inactiveCount = customers.filter((c) => c.status === "inactive").length;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Dashboard</h1>
      <p className={styles.subtitle}>Overview of your workspace</p>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Customers</div>
          <div className={styles.statValue}>{customers.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active</div>
          <div className={`${styles.statValue} ${styles.statSuccess}`}>
            {activeCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Inactive</div>
          <div className={`${styles.statValue} ${styles.statMuted}`}>
            {inactiveCount}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;