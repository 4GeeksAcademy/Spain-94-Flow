export const initialStore = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const businessStr = localStorage.getItem("business");
  const selectedBusinessStr = localStorage.getItem("selected_business");
  const clientsStr = localStorage.getItem("clients");
  const selectedClientStr = localStorage.getItem("selectedClient");

  let user = null;
  let business = [];
  let selectedBusiness = null;
  let clients = [];
  let selectedClient = null;

  try {
    if (userStr) user = JSON.parse(userStr);
    if (businessStr) business = JSON.parse(businessStr);
    if (selectedBusinessStr) selectedBusiness = JSON.parse(selectedBusinessStr);
    if (clientsStr) clients = JSON.parse(clientsStr);
    if (selectedClientStr) selectedClient = JSON.parse(selectedClientStr);
  } catch (e) {
    console.log("error in the data");
  }
  return {
    token: token || null,
    user: user || null,
    error: null,
    business: business || [],
    selectedBusiness: selectedBusiness || null,
    calendarEvents: [],
    calendarLoading: false,
    calendarError: null,
    syncStatus: null,
    clients: clients || [],
    selectedClient: selectedClient || null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "login":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));

      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
      };

    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("business");
      localStorage.removeItem("selected_business");
      localStorage.removeItem("clients");
      localStorage.removeItem("selectedClient");

      return {
        ...store,
        token: null,
        user: null,
        business: [],
        selectedBusiness: null,
        clients: [],
      };

    case "set_business":
      localStorage.setItem("business", JSON.stringify(action.payload));
      return {
        ...store,
        business: action.payload,
      };

    case "select_business":
      localStorage.setItem("selected_business", JSON.stringify(action.payload));
      return {
        ...store,
        selectedBusiness: action.payload,
      };

    case "load_calendar_events_start":
      return {
        ...store,
        calendarLoading: true,
        calendarError: null,
      };

    case "load_calendar_events_success":
      return {
        ...store,
        calendarEvents: action.payload,
        calendarLoading: false,
        calendarError: null,
      };

    case "load_calendar_event_error":
      return {
        ...store,
        calendarLoading: false,
        calendarError: action.payload,
      };

    case "sync_calendar_start":
      return {
        ...store,
        syncStatus: { loading: true, message: null, success: null },
      };

    case "sync_calendar_success":
      return {
        ...store,
        syncStatus: {
          loading: false,
          message: action.payload.msg,
          success: true,
          count: action.payload.synced_appointments.length,
        },
      };

    case "sync_calendar_error":
      return {
        ...store,
        syncStatus: {
          loading: false,
          message: action.payload,
          success: false,
        },
      };

    case "set_clients":
      localStorage.setItem("clients", JSON.stringify(action.payload));
      return {
        ...store,
        clients: action.payload,
      };
    case "select_client":
      localStorage.setItem("selectedClient", JSON.stringify(action.payload));
      return {
        ...store,
        selectedClient: action.payload,
      };

    case "set_error":
      return {
        ...store,
        error: action.payload,
      };

    default:
      return store;
  }
}
