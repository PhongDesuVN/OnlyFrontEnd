
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/routes.jsx";
import { NotificationProvider } from "./Components/NotificationSystem.jsx";
import "./App.css";

export default function App() {

    return (
            <NotificationProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </NotificationProvider>
    );
}
