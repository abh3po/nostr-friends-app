import React, { useState } from "react";
import { nip19 } from "nostr-tools";

interface SettingsPageProps {
  pubkey: string;
  viewKey: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ pubkey, viewKey }) => {
  const [showViewKey, setShowViewKey] = useState(false);
  const npub = nip19.npubEncode(pubkey);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Account Settings
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Your Nostr Identity
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Public Key (npub)
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={npub}
                    readOnly
                    className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(npub)}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                    title="Copy to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This is your public identifier on Nostr. Share it with others
                  so they can add you as a friend.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your View Key
                </label>
                <div className="flex items-center">
                  <input
                    type={showViewKey ? "text" : "password"}
                    value={viewKey}
                    readOnly
                    className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowViewKey(!showViewKey)}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                    title={showViewKey ? "Hide view key" : "Show view key"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      {showViewKey ? (
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      )}
                      {showViewKey ? (
                        <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M10 18c-4.478 0-8.268-2.943-9.543-7C1.732 5.943 5.522 3 10 3s8.268 2.943 9.543 7c-1.275 4.057-5.064 7-9.543 7zm0-14a9.969 9.969 0 00-9.543 7c1.264 4.035 4.988 7 9.543 7a9.969 9.969 0 009.543-7c-1.264-4.035-4.988-7-9.543-7zm0 10a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(viewKey)}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-800"
                    title="Copy to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your view key is used to encrypt and decrypt private posts.
                  Keep it secure.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              App Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Dark Mode
                  </h4>
                  <p className="text-xs text-gray-500">
                    Switch between light and dark themes
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="toggle"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="toggle"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Notifications
                  </h4>
                  <p className="text-xs text-gray-500">
                    Enable or disable notifications
                  </p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="notifications"
                    id="notifications"
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    defaultChecked
                  />
                  <label
                    htmlFor="notifications"
                    className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          About nostrfriends
        </h3>
        <p className="text-gray-600 mb-3">
          nostrfriends is a decentralized social media platform built on the
          Nostr protocol. Your data is encrypted and only accessible to you and
          your friends.
        </p>
        <p className="text-sm text-gray-500">Version 1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
