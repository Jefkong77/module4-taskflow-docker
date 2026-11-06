// src/pages/WelcomePage.jsx
import { Link } from "react-router";
import styles from "./WelcomePage.module.css";

function WelcomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoMark}>
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <h1 className={styles.heading}>Simple CRM</h1>
        <p className={styles.lead}>Manage your customers in one place.</p>

        <Link to="/login" className={styles.loginBtn}>
          Log In
        </Link>
      </div>
    </div>
  );
}

export default WelcomePage;