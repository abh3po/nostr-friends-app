import { useState } from 'react';
import { Relay, UnsignedEvent, generateSecretKey, getPublicKey, getEventHash, finalizeEvent } from 'nostr-tools';
import { decode } from 'nostr-tools/nip19';

interface AddFriendProps {
  relay: Relay | null;
  pubkey: string;
  viewKey: string;
  setFriends: React.Dispatch<React.SetStateAction<string[]>>;
}

const AddFriend: React.FC<AddFriendProps> = ({ relay, pubkey, viewKey, setFriends }) => {
  const [newFriend, setNewFriend] = useState('');

  const addFriend = async () => {
    if (!newFriend || !relay || !window.nostr) return;
    try {
      const { type, data } = decode(newFriend);
      if (type !== 'npub') return;

      const hexPubkey = data as string;
      const rumor: UnsignedEvent = {
        kind: 21,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['key', 'view', viewKey]],
        content: '',
      };

      // Seal (Kind 13, signed with user's key via NIP-07)
      const rumorJson = JSON.stringify(rumor);
      const encryptedRumor = await window.nostr.nip44!.encrypt(hexPubkey, rumorJson);
      const sealEvent: UnsignedEvent = {
        kind: 13,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', hexPubkey]],
        content: encryptedRumor,
      };
      const signedSeal = await window.nostr.signEvent(sealEvent);

      // Wrap (Kind 1059, signed with ephemeral key)
      const ephemeralPrivateKey = generateSecretKey();
      const ephemeralPubkey = getPublicKey(ephemeralPrivateKey);
      const encryptedSeal = await window.nostr.nip44!.encrypt(hexPubkey, JSON.stringify(signedSeal));
      const wrapEvent: UnsignedEvent = {
        kind: 1059,
        pubkey: ephemeralPubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', hexPubkey]],
        content: encryptedSeal,
      };
      const signedWrap = finalizeEvent(wrapEvent, ephemeralPrivateKey);

      relay.publish(signedWrap);
      console.log('Wrapped and published to relay:', signedWrap);
      setFriends((prev) => {
        if (prev.includes(hexPubkey)) return prev;
        const updatedFriends = [...prev, hexPubkey];

        // Rumor (unsigned Kind 21)
        

        return updatedFriends;
      });
      setNewFriend('');
    } catch (error) {
      console.error('Invalid npub or gift wrap failed:', error);
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
        {setFriends && Array.isArray(setFriends) && setFriends.map((f) => (
          <li key={f}>{f.slice(0, 8)}...</li>
        ))}
      </ul>
    </div>
  );
};

export default AddFriend;