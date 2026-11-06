import { createContext, useReducer, useState, useEffect } from "react";

import { customerReducer, initialState } from "../reducers/customerReducer";
import { API_BASE } from "../App";

// eslint-disable-next-line react-refresh/only-export-components
export const CustomerContext = createContext();

export function CustomerProvider({ children }) {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { customers, loading, error, submitting } = state;

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCustomers = customers.filter(
    (c) =>
      (statusFilter === "all" || c.status === statusFilter) &&
      // ?? "" guards against empty fields coming from the Spring Boot API.
      ((c.firstName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.lastName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())),
  );

  useEffect(() => {
    const loadCustomers = async () => {
      dispatch({ type: "FETCH_START" });
      try {
        // Simulate network delay to show the loading spinner
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch(`${API_BASE}/customers`);
        const data = await response.json();
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_ERROR", payload: err.message });
      }
    };
    loadCustomers();
  }, []);

  const addCustomer = async (customerData) => {
    dispatch({ type: "ADD_START" });
    try {
      const response = await fetch(`${API_BASE}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const created = await response.json();
      dispatch({ type: "ADD_CUSTOMER", payload: created });
      return created;
    } catch (err) {
      dispatch({ type: "ADD_ERROR" });
      alert(`Failed to add customer: ${err.message}`);
    }
  };



  const updateCustomer = async (customerId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const updated = await response.json();
      dispatch({ type: "UPDATE_CUSTOMER", payload: updated });
    } catch (err) {
      alert(`Failed to update customer: ${err.message}`);
    }
  };

  const deleteCustomer = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      const response = await fetch(`${API_BASE}/customers/${customerId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      dispatch({ type: "DELETE_CUSTOMER", payload: customerId });

    } catch (err) {
      alert(`Failed to delete customer: ${err.message}`);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        filteredCustomers,
        loading,
        error,
        submitting,

        searchTerm,
        statusFilter,

        addCustomer,
        updateCustomer,
        deleteCustomer,

        setSearchTerm,
        setStatusFilter,

      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}
