import { useEffect } from "react";
import { Relay, getPublicKey, nip44, Event, nip19 } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

type DecryptedEvent = Event & { decryptedContent?: string };

interface PostListProps {
  relay: Relay | null;
  friends: string[];
  setPosts: React.Dispatch<React.SetStateAction<DecryptedEvent[]>>;
  pubkey: string;
  viewKey: string;
  viewKeyMap: Map<string, string>
  posts: DecryptedEvent[]
}

const PostList: React.FC<PostListProps> = ({
  relay,
  friends,
  setPosts,
  pubkey,
  viewKey,
  viewKeyMap,
  posts
}) => {
  useEffect(() => {
    console.log("VIEW KEY MAP IS", viewKeyMap)
    if (!relay || !friends.length || !window.nostr) return;
    console.log("GETTING POST FROM FRIENDS", friends);
    const sub = relay.subscribe(
      [
        { kinds: [9876], authors: friends }, // Posts from friends
      ],
      {
        onevent: async (e) => {
          console.log("GOT A FRIENDS POST!", e);
          try {
            // Decrypt with viewKey as a symmetric key
            let viewKeyHex = viewKeyMap.get(e.pubkey)
            if(!viewKeyHex) throw Error("FRIENDS KEY NOT FOUND IN VIEW KEY MAP")
            let UIntViewKey = hexToBytes(viewKeyHex!);
            let conversationKey = nip44.getConversationKey(
              UIntViewKey,
              getPublicKey(UIntViewKey)
            );
            const decryptedContent = nip44.decrypt(e.content, conversationKey);
            console.log("DECRYPTED FRIENDS POST IS", decryptedContent)
            setPosts((prev) => {
              console.log("PREV POSTS ARE", prev)
              if (!prev.find((p) => p.id === e.id)) {
                return [...prev, { ...e, decryptedContent }];
              }
              return prev;
            });
          } catch (error) {
            console.error("Decryption failed:", error);
          }
        },
      }
    );

    return () => sub.close();
  }, [relay, friends, setPosts, viewKey]);

  return (
    <div>
      <h2>Friends' Posts</h2>
      <ul>
        {posts &&
          Array.isArray(posts) &&
          posts.map((post) => (
            <li key={post.id}>
              <strong>{nip19.npubEncode(post.pubkey).slice(0, 8)}...</strong>:{" "}
              {post.decryptedContent || "Decrypting..."}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default PostList;
