import { useState } from "react";
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

interface AddFriendProps {
  relay: Relay | null;
  pubkey: string;
  viewKey: string;
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
  friends: string[];
}

const AddFriend: React.FC<AddFriendProps> = ({ relay, pubkey, viewKey, setFriends, friends }) => {
  const [newFriend, setNewFriend] = useState("");

  const addFriend = async () => {
    if (!newFriend || !relay || !window.nostr) return;
    try {
      const { type, data } = decode(newFriend);
      if (type !== "npub") return;

      const hexPubkey = data as string;
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
      const encryptedSeal = nip44!.encrypt(JSON.stringify(signedSeal), conversationKey);
      const wrapEvent: UnsignedEvent = {
        kind: 1059,
        pubkey: ephemeralPubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", hexPubkey]],
        content: encryptedSeal,
      };
      const signedWrap = finalizeEvent(wrapEvent, ephemeralPrivateKey);

      relay.publish(signedWrap);
      console.log("Wrapped and published to relay:", signedWrap);
      setFriends((prev) => {
        console.log("SETTING NEW FRIENDS", prev, hexPubkey);
        if (prev.includes(hexPubkey)) return prev;
        const updatedFriends = [...prev, hexPubkey];

        return updatedFriends;
      });
      setNewFriend("");
    } catch (error) {
      console.error("Invalid npub or gift wrap failed:", error);
    }
  };

  return (
    <div>
      <h2>Add Friend</h2>
      <input
        type="text"
        value={newFriend}
        onChange={(e) => setNewFriend(e.target.value)}
        placeholder="Friend's npub"
      />
      <button onClick={addFriend}>Add</button>
      <ul>
        {friends &&
          Array.isArray(friends) &&
          friends.map((f) => <li key={f}>{nip19.npubEncode(f).slice(0)}...</li>)}
      </ul>
    </div>
  );
};

export default AddFriend;
