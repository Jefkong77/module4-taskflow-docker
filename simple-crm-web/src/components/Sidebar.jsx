import { NavLink } from "react-router";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import styles from "./Sidebar.module.css";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";



function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function navLinkClass({ isActive }) {
  return styles.navItem + (isActive ? " " + styles.navItemActive : "");
}

function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span />
          <span />
          <span />
          <span />
        </div>

        <span className={styles.logoText}>Simple CRM</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navLabel}>Workspace</div>

        <NavLink to="/app" end className={navLinkClass}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/app/customers" className={navLinkClass}>
          <Users size={17} />
          <span>Customers</span>
        </NavLink>
      </nav>

      <div className={styles.foot}>
        <div className={styles.footAvatar}>
          {initials(user.name)}
        </div>

        <div className={styles.footWho}>
          <div className={styles.footName}>{user.name}</div>

          <span
            className={`${styles.roleBadge} ${
              user.role === "admin"
                ? styles.roleBadgeAdmin
                : styles.roleBadgeUser
            }`}
          >
            {user.role}
          </span>
        </div>

        <button
          className={styles.signOutBtn}
          onClick={logout} title="Sign out">
        
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;