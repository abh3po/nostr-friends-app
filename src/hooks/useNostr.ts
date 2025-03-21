import { useState, useEffect } from 'react';
import { Relay, UnsignedEvent, generateSecretKey, getPublicKey, getEventHash, finalizeEvent } from 'nostr-tools';

const generateRandomViewKey = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const useNostr = () => {
  const [pubkey, setPubkey] = useState<string>('');
  const [relay, setRelay] = useState<Relay | null>(null);
  const [viewKey, setViewKey] = useState<string>('');
  const [viewKeyMap, setViewKeyMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const r = new Relay('wss://relay.damus.io');
    r.connect();
    setRelay(r);

    const tryAutoLogin = async () => {
      if (window.nostr) {
        try {
          const userPubkey = await window.nostr.getPublicKey();
          setPubkey(userPubkey);

          // Check for existing view key
          r.subscribe([{ kinds: [1059], '#p': [userPubkey] }], {
            onevent: async (e) => {
              try {
                const encryptedInner = e.content;
                const innerJson = await window.nostr!.nip44!.decrypt(userPubkey, encryptedInner);
                const innerEvent = JSON.parse(innerJson);
                if (innerEvent.kind === 13) {
                  const rumorJson = await window.nostr!.nip44!.decrypt(userPubkey, innerEvent.content);
                  const rumor = JSON.parse(rumorJson);
                  console.log("FOUND RUMOR KEY!!!!!!!!!", rumor)
                  if (rumor.kind === 21) {
                    const viewKeyTag = rumor.tags.find((t: string[]) => t[0] === 'key' && t[1] === 'view');
                    if (viewKeyTag) {
                      setViewKeyMap((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(rumor.pubkey, viewKeyTag[2]);
                        return newMap;
                      })
                    }
                    if(rumor.pubkey === pubkey){
                      setViewKey(viewKeyTag[2])
                    }
                  }
                }
              } catch (error) {
                console.error('Failed to decrypt view key:', error);
              }
            },
            oneose: () => {
              if (!viewKeyMap.get(userPubkey)) console.log('No view key found; user needs to generate one.');
            },
          });
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };
    tryAutoLogin();

    return () => {
      r.close();
    };
  }, [pubkey]);

  const login = async () => {
    if (window.nostr) {
      try {
        const userPubkey = await window.nostr.getPublicKey();
        setPubkey(userPubkey);
      } catch (error) {
        console.error('Manual login failed:', error);
        alert('Failed to sign in. Ensure a NIP-07 extension is installed and enabled.');
      }
    } else {
      alert('NIP-07 extension not detected. Please install one (e.g., Alby).');
    }
  };

  const generateViewKey = async () => {
    if (!window.nostr || !relay || !pubkey) return;

    const newViewKey = generateRandomViewKey();
    setViewKey(newViewKey);

    // Rumor (unsigned Kind 21)
    const rumor: UnsignedEvent = {
      kind: 21,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['key', 'view', newViewKey]],
      content: '',
    };

    // Seal (Kind 13, signed with user's key via NIP-07)
    const rumorJson = JSON.stringify(rumor);
    const encryptedRumor = await window.nostr.nip44!.encrypt(pubkey, rumorJson);
    const sealEvent: UnsignedEvent = {
      kind: 13,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', pubkey]],
      content: encryptedRumor,
    };
    const signedSeal = await window.nostr.signEvent(sealEvent);

    // Wrap (Kind 1059, signed with ephemeral key)
    const ephemeralPrivateKey = generateSecretKey();
    const ephemeralPubkey = getPublicKey(ephemeralPrivateKey);
    const encryptedSeal = await window.nostr.nip44!.encrypt(pubkey, JSON.stringify(signedSeal));
    const wrapEvent: UnsignedEvent = {
      kind: 1059,
      pubkey: ephemeralPubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['p', pubkey]],
      content: encryptedSeal,
    };
    const signedWrap = finalizeEvent(wrapEvent, ephemeralPrivateKey);

    await relay.publish(signedWrap);

    console.log('View key generated and stored');
  };

  return { pubkey, relay, login, viewKey, generateViewKey, viewKeyMap };
};