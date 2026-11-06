import styles from "./SearchBar.module.css";

function SearchBar({ searchTerm, onSearch }) {
  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
