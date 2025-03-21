import React, { useState } from "react";
import { nip19, Event } from "nostr-tools";

type DecryptedEvent = Event & { decryptedContent?: string };

interface ProfilePageProps {
  pubkey: string;
  viewKey: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ pubkey, viewKey }) => {
  const [userPosts] = useState<DecryptedEvent[]>([]);
  const npub = nip19.npubEncode(pubkey);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
              {pubkey.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-4 pb-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-800 truncate">
                {npub.substring(0, 8)}...{npub.substring(npub.length - 4)}
              </h2>
              <p className="text-gray-600 text-sm">@{npub.substring(0, 12)}...</p>
            </div>
          </div>
          <div className="text-gray-700 text-sm mb-4">
            <div className="mb-2">
              <strong>Nostr Key:</strong> {npub}
            </div>
            <div>
              <strong>View Key:</strong> {viewKey.substring(0, 12)}...
              {viewKey.substring(viewKey.length - 8)}
            </div>
          </div>
          <div className="flex space-x-3 text-sm">
            <div className="font-semibold">
              <span className="text-blue-600">0</span> Following
            </div>
            <div className="font-semibold">
              <span className="text-blue-600">0</span> Followers
            </div>
            <div className="font-semibold">
              <span className="text-blue-600">0</span> Posts
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Posts</h3>

        {userPosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-1">No Posts Yet</h4>
            <p className="text-gray-500">Your posts will appear here after you create them.</p>
          </div>
        ) : (
          <div className="space-y-4">{/* Posts would be rendered here */}</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
