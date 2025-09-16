import { useState } from "react";
// import { useNavigate } from "react-router"; // Import useNavigate for programmatic navigation
import Swal from "sweetalert2";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  // const navigate = useNavigate();

  const { profile } = useAuth();
  const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    console.log("Logout button clicked"); // Debug log
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981", // Matches brand-500 (emerald-500)
      cancelButtonColor: "#ef4444", // Matches error-500 (red-500)
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "dark:bg-gray-800 dark:text-gray-200", // Dark mode support
        title: "dark:text-white",
        htmlContainer: "dark:text-gray-300",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log("User confirmed logout"); // Debug log
        logout();
        closeDropdown();
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        {profile?.profile?.avatar ? (
          <img
            src={VITE_IMAGE_URL + profile.profile.avatar}
            alt="User avatar"
            className="mr-3 h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <span className="mr-3 flex items-center justify-center rounded-full h-11 w-11 bg-emerald-600 text-white font-semibold">
            {profile
              ? profile?.profile?.lastName
                ? `${profile?.profile?.firstName[0]}${profile?.profile?.lastName[0]}`.toUpperCase()
                : profile?.profile?.firstName[0].toUpperCase()
              : "U"}
          </span>
        )}

        <span className="block mr-1 font-medium text-theme-md">
          {profile
            ? `${profile?.profile?.firstName
                .charAt(0)
                .toUpperCase()}${profile?.profile?.firstName.slice(1)}`
            : "User"}
          {/* <p className="text-theme-xs font-normal ">
            {profile.email&& profile?.email.length > 10 ? profile.email.substring(0, 10) + "..." : profile ? profile.email: ""}
           
          </p> */}
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {profile
              ? `${profile?.profile?.firstName} ${profile?.profile?.lastName}`
              : "User"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {profile ? profile.email : ""}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <Settings />
              Account settings
            </DropdownItem>
          </li>
        </ul>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          aria-label="Sign out"
        >
          <LogOut />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
