import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import TeamMembers from "./pages/OtherPage/TeamMembers";
import Customers from "./pages/OtherPage/Customers";
import Chats from "./pages/OtherPage/Chats";
import Subscription from "./pages/OtherPage/Subscription";
import { AuthProvider, ProtectedRoute, RequireAuth } from "./context/AuthContext";

export default function App() {
  return (
    <>
      <Router>
        <AuthProvider>  {/* 👈 Moved inside Router */}
          <ScrollToTop />
          <Routes>
            {/* Protected Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index path="/" element={<Home />} />
              <Route index path="/team-members" element={<TeamMembers />} />
              <Route index path="/customers" element={<Customers />} />
              <Route index path="/chats" element={<Chats />} />
              <Route index path="/subscription" element={<Subscription />} /> 

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
            </Route>

            {/* Auth Routes (Public, redirect if authenticated) */}
            <Route
              path="/signin"
              element={
                <RequireAuth redirectTo="/">
                  <SignIn />
                </RequireAuth>
              }
            />
            <Route
              path="/signup"
              element={
                <RequireAuth redirectTo="/">
                  <SignUp />
                </RequireAuth>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}