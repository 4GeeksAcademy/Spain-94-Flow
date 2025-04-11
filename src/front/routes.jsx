import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import { Login } from "./pages/Login/Login.jsx";
import { Business} from "./pages/Business.jsx";
import { ClientList } from "./pages/ClientList";
import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { NewClient } from "./pages/NewClient/NewClient.jsx"
import { NewService } from "./pages/NewService/NewService.jsx"




export const AppRoutes = createBrowserRouter(
    createRoutesFromElements(

        <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
            <Route index element={<Login />} />
            <Route path="/business" element={<Business />} />
            <Route path="/clientes" element={<ClientList />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/newclient" element={<NewClient />} />
            <Route path="/newservice" element={<NewService />} />
        </Route>
    )
);