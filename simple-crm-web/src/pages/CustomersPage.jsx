// src/pages/CustomersPage.jsx
import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { CustomerContext } from "../contexts/CustomerContext";
import CustomerCard from "../components/CustomerCard";
import SearchBar from "../components/SearchBar";
import Spinner from "../components/Spinner";

function CustomersPage() {
  const {
    filteredCustomers,
    loading,
    error,
    searchTerm,
    statusFilter,
    setSearchTerm,
    setStatusFilter,
  } = useContext(CustomerContext);

  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (error) return <p className="status-message error">Error: {error}</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <Link to="/app/customers/new" className="btn-primary-link">
          Add Customer
        </Link>
      </div>

      <div className="filter-bar">
        {["all", "active", "inactive"].map((f) => (
          <button
            key={f}
            className={`filter-btn${statusFilter === f ? " filter-btn-active" : ""}`}
            onClick={() => setStatusFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="customer-list">
        <h2>Customers ({filteredCustomers.length})</h2>
        {filteredCustomers.length === 0 ? (
          <p className="empty-state">
            {searchTerm
              ? "No customers match your search."
              : "No customers yet."}
          </p>
        ) : (
          <div className="customers">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onSelect={(id) => navigate(`/app/customers/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomersPage;