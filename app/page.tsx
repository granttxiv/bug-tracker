export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50 font-sans dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center py-32 px-16 gap-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">TrackMe</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Automated Bug Tracking & Client Support Portal
          </p>
        </div>

        <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Phase 1: Foundation & Auth ✅
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Backend API Status: Ready
              </h3>
              <p className="text-green-700 dark:text-green-200 text-sm">
                Database configured, auth endpoints running.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Available Endpoints</h3>
              <ul className="space-y-2 font-mono text-sm">
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400">POST</span>{" "}
                  /api/auth/register
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-blue-600 dark:text-blue-400">POST</span>{" "}
                  /api/auth/login
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-green-600 dark:text-green-400">GET</span>{" "}
                  /api/auth/me
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-red-600 dark:text-red-400">POST</span>{" "}
                  /api/auth/logout
                </li>
                <li className="text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-green-600 dark:text-green-400">GET</span>{" "}
                  /api/health
                </li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-blue-900 dark:text-blue-100 text-sm">
                <strong>Next Steps:</strong> Phase 2 will add ticket CRUD, comments, and
                attachments.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">Backend running on Next.js | PostgreSQL database ready</p>
        </div>
      </main>
    </div>
  );
}
