// Initial State
export const initialState = {
  customers: [],
  loading: false,
  error: null,
  submitting: false,

};

// Reducer function
// action : { type: ..., payload: ... }
export function customerReducer(state, action) {
  switch (action.type) {
    case "FETCH_START": {
      // const newState = { ...state };
      // newState.loading = true;
      // newState.error = null;
      // return newState;
      return {
        ...state,
        loading: true,
        error: null,
      };
    }
    case "FETCH_SUCCESS": {
      return {
        ...state,
        loading: false,
        customers: action.payload,
      };
    }
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "ADD_START":
      return { ...state, submitting: true };

    case "ADD_CUSTOMER":
      return {
        ...state,
        submitting: false,

        customers: [...state.customers, action.payload],
      };

    case "ADD_ERROR":
      // In a production app, this case would also set an addError field
      // to display inline feedback. Here we use alert() to keep the lesson focused.
      return { ...state, submitting: false };



    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };

    case "DELETE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
      };

    default:
      return state;
  }
}
