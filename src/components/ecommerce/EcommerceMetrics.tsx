import {
  ArrowDownIcon,
  ArrowUpIcon,
  // BoxIconLine,
  // GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  MessageSquare, // Placeholder for messages
  Video,         // Placeholder for videos
  Image,        // Placeholder for images
  CheckCircle,  // Placeholder for subscriptions
  Calendar,     // Placeholder for validity
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item: Total Messages --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <MessageSquare className="text-gray-800 size-6 dark:text-white/90" />
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Video className="text-gray-800 size-6 dark:text-white/90" />
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
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Image className="text-gray-800 size-6 dark:text-white/90" />
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

      {/* <!-- Metric Item: Selected Subscriptions --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CheckCircle className="text-gray-800 size-6 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Selected Subscriptions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              892
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            5.29%
          </Badge>
        </div>
      </div>

      {/* <!-- Metric Item: Validity --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Calendar className="text-gray-800 size-6 dark:text-white/90" />
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
  );
}