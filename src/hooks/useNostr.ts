import { useState, useEffect } from "react";
import {
  Relay,
  UnsignedEvent,
  generateSecretKey,
  getPublicKey,
  finalizeEvent,
  nip44,
} from "nostr-tools";

const generateRandomViewKey = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const useNostr = () => {
  const [pubkey, setPubkey] = useState<string>("");
  const [relay, setRelay] = useState<Relay | null>(null);
  const [viewKey, setViewKey] = useState<string>("");
  const [viewKeyMap, setViewKeyMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const r = new Relay("wss://relay.damus.io");
    r.connect();
    setRelay(r);

    const tryAutoLogin = async () => {
      if (window.nostr) {
        try {
          const userPubkey = await window.nostr.getPublicKey();
          setPubkey(userPubkey);

          // Check for existing view key
          r.subscribe([{ kinds: [1059], "#p": [userPubkey] }], {
            onevent: async (e) => {
              try {
                const encryptedInner = e.content;
                // Add null check before attempting to decrypt
                if (!encryptedInner) {
                  console.error("Empty encrypted content in event");
                  return;
                }

                let innerJson;
                try {
                  innerJson = await window.nostr!.nip44!.decrypt(e.pubkey, encryptedInner);
                  // Add null check before parsing
                  if (!innerJson) {
                    console.error("Decryption returned undefined/null");
                    return;
                  }
                } catch (decryptError) {
                  console.error("Failed to decrypt outer envelope:", decryptError);
                  return;
                }

                let innerEvent;
                try {
                  innerEvent = JSON.parse(innerJson);
                } catch (parseError) {
                  console.error(
                    "Failed to parse decrypted JSON:",
                    parseError,
                    "Raw content:",
                    innerJson
                  );
                  return;
                }

                console.log("GOT GIFT WRAP FROM", innerEvent.pubkey);

                if (innerEvent.kind === 13) {
                  let rumorJson;
                  try {
                    rumorJson = await window.nostr!.nip44!.decrypt(
                      innerEvent.pubkey,
                      innerEvent.content
                    );
                    if (!rumorJson) {
                      console.error("Inner decryption returned undefined/null");
                      return;
                    }
                  } catch (innerDecryptError) {
                    console.error("Failed to decrypt inner content:", innerDecryptError);
                    return;
                  }

                  let rumor;
                  try {
                    rumor = JSON.parse(rumorJson);
                  } catch (innerParseError) {
                    console.error(
                      "Failed to parse inner JSON:",
                      innerParseError,
                      "Raw content:",
                      rumorJson
                    );
                    return;
                  }

                  console.log("FOUND RUMOR KEY!!!!!!!!!", rumor);

                  if (rumor.kind === 21) {
                    const viewKeyTag = rumor.tags.find(
                      (t: string[]) => t[0] === "key" && t[1] === "view"
                    );
                    if (viewKeyTag) {
                      setViewKeyMap((prev) => {
                        const newMap = new Map(prev);
                        newMap.set(rumor.pubkey, viewKeyTag[2]);
                        return newMap;
                      });

                      if (rumor.pubkey === userPubkey) {
                        setViewKey(viewKeyTag[2]);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Failed to decrypt view key:", error);
              }
            },
            oneose: () => {
              if (!viewKeyMap.get(userPubkey))
                console.log("No view key found; user needs to generate one.");
            },
          });
        } catch (error) {
          console.error("Auto-login failed:", error);
        }
      }
    };
    tryAutoLogin();

    return () => {
      //r.close();
    };
  }, [pubkey]);

  const login = async () => {
    if (window.nostr) {
      try {
        const userPubkey = await window.nostr.getPublicKey();
        setPubkey(userPubkey);
      } catch (error) {
        console.error("Manual login failed:", error);
        alert("Failed to sign in. Ensure a NIP-07 extension is installed and enabled.");
      }
    } else {
      alert("NIP-07 extension not detected. Please install one (e.g., Alby).");
    }
  };

  const generateViewKey = async () => {
    if (!window.nostr || !relay || !pubkey) return;

    const newViewKey = generateRandomViewKey();
    setViewKey(newViewKey);

    const rumor: UnsignedEvent = {
      kind: 21,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["key", "view", newViewKey]],
      content: "",
    };

    const rumorJson = JSON.stringify(rumor);
    const encryptedRumor = await window.nostr.nip44!.encrypt(pubkey, rumorJson);
    const sealEvent: UnsignedEvent = {
      kind: 13,
      pubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", pubkey]],
      content: encryptedRumor,
    };
    const signedSeal = await window.nostr.signEvent(sealEvent);

    const ephemeralPrivateKey = generateSecretKey();
    const ephemeralPubkey = getPublicKey(ephemeralPrivateKey);
    const conversationKey = nip44.getConversationKey(ephemeralPrivateKey, pubkey);
    const encryptedSeal = nip44!.encrypt(JSON.stringify(signedSeal), conversationKey);
    const wrapEvent: UnsignedEvent = {
      kind: 1059,
      pubkey: ephemeralPubkey,
      created_at: Math.floor(Date.now() / 1000),
      tags: [["p", pubkey]],
      content: encryptedSeal,
    };
    const signedWrap = finalizeEvent(wrapEvent, ephemeralPrivateKey);

    await relay.publish(signedWrap);

    console.log("View key generated and stored");
  };

  return { pubkey, relay, login, viewKey, generateViewKey, viewKeyMap };
};
