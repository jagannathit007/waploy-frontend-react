import { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  MessageSquare,
  Video,
  Image,
  Calendar,
  QrCode,
} from "lucide-react";
import axios from "axios";

interface QRCodeResponse {
  success: boolean;
  data?: {
    qrCode: string;
    companyId: string;
  };
  message?: string;
}

interface ProfileData {
  company: {
    _id: string;
    name: string;
    phone: string;
    website: string;
    business: string;
    logo: string;
  };
}

interface DashboardCounts {
  totalMessages: number;
  totalImages: number;
  totalVideos: number;
  totalAudios: number;
  totalText: number;
}

interface CountsResponse {
  success: boolean;
  message?: string;
  data?: DashboardCounts;
}

export default function Dashboard() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [counts, setCounts] = useState<DashboardCounts>({
    totalMessages: 0,
    totalImages: 0,
    totalVideos: 0,
    totalAudios: 0,
    totalText: 0,
  });
  const [countsLoading, setCountsLoading] = useState(true);
  const [countsError, setCountsError] = useState<string | null>(null);

  // Get companyId from local storage
  const profile = JSON.parse(localStorage.getItem("profile") || "{}") as ProfileData;
  const companyId = profile.company?._id || "YOUR_DEFAULT_COMPANY_ID";
  const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:3090/api/web";

  // Fetch dashboard counts
  const fetchCounts = async () => {
    if (!companyId || companyId === "YOUR_DEFAULT_COMPANY_ID") {
      setCountsError("No company ID found in profile data");
      setCountsLoading(false);
      return;
    }

    try {
      setCountsLoading(true);
      const response = await axios.post<CountsResponse>(
        `${API_BASE_URL}/whatsapp/${companyId}/counts`
      );

      if (response.data.success && response.data.data) {
        setCounts(response.data.data);
        setCountsError(null);
      } else {
        setCountsError(response.data.message || "Failed to fetch dashboard counts");
      }
    } catch (err) {
      setCountsError("Error fetching dashboard counts. Please try again later.");
      console.error(err);
    } finally {
      setCountsLoading(false);
    }
  };

  // Fetch QR code
  const fetchQRCode = async () => {
    if (!companyId || companyId === "YOUR_DEFAULT_COMPANY_ID") {
      setError("No company ID found in profile data");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get<QRCodeResponse>(
        `${API_BASE_URL}/whatsapp/${companyId}/qrcode`
      );

      if (response.data.success && response.data.data?.qrCode) {
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=${encodeURIComponent(response.data.data.qrCode)}`;
        setQrCode(qrCodeUrl);
        setError(null);
      } else {
        setQrCode(null);
        setError(response.data.message || "Failed to load QR code");
      }
    } catch (err) {
      setQrCode(null);
      setError("Error fetching QR code. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to WhatsApp
  const handleConnect = async () => {
    if (!companyId || companyId === "YOUR_DEFAULT_COMPANY_ID") {
      setError("No company ID found in profile data");
      return;
    }

    try {
      setIsConnecting(true);
      const response = await axios.post<QRCodeResponse>(
        `${API_BASE_URL}/whatsapp/${companyId}/connect`
      );

      if (response.data.success) {
        await fetchQRCode();
      } else {
        setError(response.data.message || "Failed to connect to WhatsApp");
      }
    } catch (err) {
      setError("Error connecting to WhatsApp. Please try again later.");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from WhatsApp
  const handleDisconnect = async () => {
    if (!companyId || companyId === "YOUR_DEFAULT_COMPANY_ID") {
      setError("No company ID found in profile data");
      return;
    }

    try {
      setIsDisconnecting(true);
      const response = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/whatsapp/${companyId}/disconnect`
      );

      if (response.data.success) {
        setQrCode(null);
        setError(null);
      } else {
        setError(response.data.message || "Failed to disconnect from WhatsApp");
      }
    } catch (err) {
      setError("Error disconnecting from WhatsApp. Please try again later.");
      console.error(err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Fetch counts on component mount
  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with QR Code Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Stats Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 md:gap-6">
            {/* Metric Item: Total Messages */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl dark:bg-emerald-900/20">
                <MessageSquare className="text-emerald-600 size-6 dark:text-emerald-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Messages
                  </span>
                  {countsLoading ? (
                    <p className="mt-2 text-gray-500">Loading...</p>
                  ) : countsError ? (
                    <p className="mt-2 text-red-500 text-sm">{countsError}</p>
                  ) : (
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                      {counts.totalMessages.toLocaleString()}
                    </h4>
                  )}
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  8.23%
                </Badge>
              </div>
            </div>

            {/* Metric Item: Total Videos */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-900/20">
                <Video className="text-blue-600 size-6 dark:text-blue-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Videos
                  </span>
                  {countsLoading ? (
                    <p className="mt-2 text-gray-500">Loading...</p>
                  ) : countsError ? (
                    <p className="mt-2 text-red-500 text-sm">{countsError}</p>
                  ) : (
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                      {counts.totalVideos.toLocaleString()}
                    </h4>
                  )}
                </div>
                <Badge color="error">
                  <ArrowDownIcon />
                  3.17%
                </Badge>
              </div>
            </div>

            {/* Metric Item: Total Images */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl dark:bg-purple-900/20">
                <Image className="text-purple-600 size-6 dark:text-purple-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Images
                  </span>
                  {countsLoading ? (
                    <p className="mt-2 text-gray-500">Loading...</p>
                  ) : countsError ? (
                    <p className="mt-2 text-red-500 text-sm">{countsError}</p>
                  ) : (
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                      {counts.totalImages.toLocaleString()}
                    </h4>
                  )}
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  15.64%
                </Badge>
              </div>
            </div>

            {/* Metric Item: Active Subscriptions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-900/20">
                <Calendar className="text-orange-600 size-6 dark:text-orange-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Active Subscriptions
                  </span>
                  {countsLoading ? (
                    <p className="mt-2 text-gray-500">Loading...</p>
                  ) : countsError ? (
                    <p className="mt-2 text-red-500 text-sm">{countsError}</p>
                  ) : (
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                      745
                    </h4>
                  )}
                </div>
                <Badge color="error">
                  <ArrowDownIcon />
                  2.13%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section - Top Right */}
        <div className="lg:w-80">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6 h-full">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
                  <QrCode className="text-emerald-600 size-4 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Connect To WhatsApp
                </h3>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Scan QR code to join Waploy platform
              </p>

              {/* QR Code Display */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-50">
                  {isLoading ? (
                    <div className="w-52 h-52 bg-gray-200 dark:bg-gray-300 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Loading QR code...</p>
                    </div>
                  ) : error ? (
                    <div className="w-52 h-52 bg-gray-200 dark:bg-gray-300 rounded-lg flex items-center justify-center">
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    </div>
                  ) : qrCode ? (
                    <img
                      src={qrCode}
                      alt="WhatsApp QR Code"
                      className="w-52 h-52 rounded-lg"
                    />
                  ) : (
                    <div className="w-52 h-52 bg-gray-200 dark:bg-gray-300 rounded-lg flex items-center justify-center">
                      <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          isConnecting
                            ? "bg-emerald-300 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        } transition-colors duration-200`}
                      >
                        {isConnecting ? "Connecting..." : "Connect"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Disconnect Button (shown only when QR code is present) */}
              {qrCode && (
                <div className="flex justify-center">
                  <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className={`px-4 py-2 rounded-lg text-white font-medium ${
                      isDisconnecting
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    } transition-colors duration-200`}
                  >
                    {isDisconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}