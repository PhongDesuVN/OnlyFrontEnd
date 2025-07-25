
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/routes.jsx";
import { NotificationProvider } from "./Components/NotificationSystem.jsx";
import "./App.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function App() {

    return (
            <NotificationProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
                <ToastContainer
                    position="top-right"
                    autoClose={3000} // tự tắt sau 3s
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnHover
                    draggable
                    theme="light"
                />
            </NotificationProvider>

    );
}
