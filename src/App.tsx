import { Routes, Route, HashRouter } from "react-router";
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
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import CustomerAddedToast from "./components/common/CustomerAddedToast";
import ChatAssignedToast from "./components/common/ChatAssignedToast";
import TaskAssignedToast from "./components/common/TaskAssignedToast";
import PrivateChatStartedToast from "./components/common/PrivateChatStartedToast";
import Teams from "./pages/OtherPage/teams";
import Lables from "./pages/OtherPage/MasterLable";
import SubscriptionManagement from "./pages/OtherPage/SubscriptionManagement";

export default function App() {
  return (
    <>
      <HashRouter>
        <AuthProvider>  {/* 👈 Moved inside Router */}
          <SocketProvider>  {/* 👈 Socket provider inside AuthProvider */}
            <ToastProvider>  {/* 👈 Toast provider inside SocketProvider */}
              <ScrollToTop />
              <AppContent />
            </ToastProvider>
          </SocketProvider>
        </AuthProvider>
      </HashRouter>
    </>
  );
}

function AppContent() {
  return (
    <>
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
              <Route index path="/team" element={<Teams />} />
              <Route index path="/team-members" element={<TeamMembers />} />
              <Route index path="/customers" element={<Customers />} />
              <Route index path="/chats" element={<Chats />} />
              <Route index path="/lables" element={<Lables />} />
              <Route index path="/subscription" element={<Subscription />} />
              <Route index path="/subscription-management" element={<SubscriptionManagement />} /> 


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
          <ToastRenderer />
        </>
      );
    }
    
    function ToastRenderer() {
      const { 
        customerAddedToast, 
        hideCustomerAddedToast, 
        chatAssignedToast, 
        hideChatAssignedToast, 
        taskAssignedToast, 
        hideTaskAssignedToast,
        privateChatStartedToast,
        hidePrivateChatStartedToast
      } = useToast();
      
      return (
        <>
          {customerAddedToast.isVisible && customerAddedToast.data && (
            <CustomerAddedToast
              isVisible={customerAddedToast.isVisible}
              onClose={hideCustomerAddedToast}
              customerData={customerAddedToast.data}
            />
          )}
          {chatAssignedToast.isVisible && chatAssignedToast.data && (
            <ChatAssignedToast
              isVisible={chatAssignedToast.isVisible}
              onClose={hideChatAssignedToast}
              assignmentData={chatAssignedToast.data}
            />
          )}
          {taskAssignedToast.isVisible && taskAssignedToast.data && (
            <TaskAssignedToast
              isVisible={taskAssignedToast.isVisible}
              onClose={hideTaskAssignedToast}
              assignmentData={taskAssignedToast.data}
            />
          )}
          {privateChatStartedToast.isVisible && privateChatStartedToast.data && (
            <PrivateChatStartedToast
              isVisible={privateChatStartedToast.isVisible}
              onClose={hidePrivateChatStartedToast}
              chatData={privateChatStartedToast.data}
            />
          )}
        </>
      );
    }