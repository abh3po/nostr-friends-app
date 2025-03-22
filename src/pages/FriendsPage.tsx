import React, { useState } from "react";
import {
  Relay,
  UnsignedEvent,
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip19,
  nip44,
} from "nostr-tools";
import { decode } from "nostr-tools/nip19";

interface FriendsPageProps {
  relay: Relay | null;
  pubkey: string;
  viewKey: string;
  friends: string[];
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
}

const FriendsPage: React.FC<FriendsPageProps> = ({
  relay,
  pubkey,
  viewKey,
  friends,
  setFriends,
}) => {
  const [newFriend, setNewFriend] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFriend = async () => {
    if (!newFriend || !relay || !window.nostr) {
      setError("Please enter a valid npub");
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const { type, data } = decode(newFriend);
      if (type !== "npub") {
        setError("Please enter a valid npub");
        setIsAdding(false);
        return;
      }

      const hexPubkey = data as string;

      if (friends.includes(hexPubkey)) {
        setError("This user is already in your friends list");
        setIsAdding(false);
        return;
      }

      const rumor: UnsignedEvent = {
        kind: 21,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["key", "view", viewKey]],
        content: "",
      };

      const rumorJson = JSON.stringify(rumor);
      const encryptedRumor = await window.nostr.nip44!.encrypt(hexPubkey, rumorJson);
      const sealEvent: UnsignedEvent = {
        kind: 13,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", hexPubkey]],
        content: encryptedRumor,
      };
      const signedSeal = await window.nostr.signEvent(sealEvent);

      const ephemeralPrivateKey = generateSecretKey();
      const ephemeralPubkey = getPublicKey(ephemeralPrivateKey);
      const conversationKey = nip44.getConversationKey(ephemeralPrivateKey, hexPubkey);
      const encryptedSeal = nip44!.encrypt(JSON.stringify(signedSeal), conversationKey);
      const wrapEvent: UnsignedEvent = {
        kind: 1059,
        pubkey: ephemeralPubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", hexPubkey]],
        content: encryptedSeal,
      };
      const signedWrap = finalizeEvent(wrapEvent, ephemeralPrivateKey);

      await relay.publish(signedWrap);

      setFriends((prev) => {
        if (prev.includes(hexPubkey)) return prev;
        return [...prev, hexPubkey];
      });

      setNewFriend("");
      setIsAdding(false);
    } catch (error) {
      console.error("Invalid npub or gift wrap failed:", error);
      setError("Failed to add friend. Please try again.");
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Friends</h2>

        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={newFriend}
            onChange={(e) => setNewFriend(e.target.value)}
            placeholder="Enter friend's npub..."
            className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addFriend}
            disabled={!newFriend || isAdding}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              !newFriend || isAdding
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isAdding ? "Adding..." : "Add Friend"}
          </button>
        </div>

        {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}

        <p className="mt-2 text-sm text-gray-500">
          Enter a friend's npub to add them and share private posts.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Friend List
            <span className="ml-2 text-sm text-gray-500">({friends.length})</span>
          </h3>
        </div>

        {friends.length === 0 ? (
          <div className="p-6 text-center text-gray-500">You haven't added any friends yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {friends.map((friend) => {
              const friendNpub = nip19.npubEncode(friend);

              return (
                <li key={friend} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                      {friend.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {friendNpub.substring(0, 12)}...
                        {friendNpub.substring(friendNpub.length - 8)}
                      </p>
                      <p className="text-xs text-gray-500">Added to friends</p>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => {
                        setFriends(friends.filter((f) => f !== friend));
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
