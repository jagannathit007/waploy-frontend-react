import {
  ArrowDownIcon,
  ArrowUpIcon,
  // BoxIconLine,
  // GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  MessageSquare, // Placeholder for messages
  Video, // Placeholder for videos
  Image, // Placeholder for images
  CheckCircle, // Placeholder for subscriptions
  Calendar, // Placeholder for validity
  QrCode, // QR Code icon
  Users, // Users icon for contacts
  Download, // Download icon
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header with QR Code Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Stats Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 md:gap-6">
            {/* <!-- Metric Item: Total Messages --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl dark:bg-emerald-900/20">
                <MessageSquare className="text-emerald-600 size-6 dark:text-emerald-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Messages
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    12,456
                  </h4>
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  8.23%
                </Badge>
              </div>
            </div>

            {/* <!-- Metric Item: Total Videos --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-blue-900/20">
                <Video className="text-blue-600 size-6 dark:text-blue-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Videos
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    1,239
                  </h4>
                </div>
                <Badge color="error">
                  <ArrowDownIcon />
                  3.17%
                </Badge>
              </div>
            </div>

            {/* <!-- Metric Item: Total Images --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-50 rounded-xl dark:bg-purple-900/20">
                <Image className="text-purple-600 size-6 dark:text-purple-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Images
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    4,872
                  </h4>
                </div>
                <Badge color="success">
                  <ArrowUpIcon />
                  15.64%
                </Badge>
              </div>
            </div>


            {/* <!-- Metric Item: Validity --> */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 rounded-xl dark:bg-orange-900/20">
                <Calendar className="text-orange-600 size-6 dark:text-orange-400" />
              </div>
              <div className="flex items-end justify-between mt-5">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Active Subscriptions
                  </span>
                  <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    745
                  </h4>
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

              {/* Simplified QR Code Display */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 dark:bg-gray-50">
                  <div className="w-52 h-52 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-300 dark:to-gray-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* QR Code Pattern Simulation */}
                    {/* Random QR Code Image */}
                    <div className="absolute inset-1 flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${Math.random()
                          .toString(36)
                          .substring(7)}`}
                        alt="QR Code"
                        className="rounded-lg "
                      />
                    </div>

                    {/* Corner markers */}
                    <div className="absolute top-1 left-1 w-4 h-4 border border-gray-800 dark:border-gray-900 rounded-sm"></div>
                    <div className="absolute top-1 right-1 w-4 h-4 border border-gray-800 dark:border-gray-900 rounded-sm"></div>
                    <div className="absolute bottom-1 left-1 w-4 h-4 border border-gray-800 dark:border-gray-900 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
