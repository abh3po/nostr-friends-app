import { useEffect } from 'react';
import { Relay, getPublicKey, nip44 } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils'

interface PostListProps {
  relay: Relay | null;
  friends: string[];
  setPosts: React.Dispatch<React.SetStateAction<any[]>>;
  pubkey: string;
  viewKey: string;
}

const PostList: React.FC<PostListProps> = ({ relay, friends, setPosts, pubkey, viewKey }) => {
  useEffect(() => {
    if (!relay || !friends.length || !window.nostr) return;

    const sub = relay.subscribe(
      [
        { kinds: [9876], authors: friends }, // Posts from friends
      ],
      {
        onevent: async (e) => {
          try {
            // Decrypt with viewKey as a symmetric key
            let UIntViewKey = hexToBytes(viewKey);
            let conversationKey = nip44.getConversationKey(UIntViewKey, getPublicKey(UIntViewKey));
            const decryptedContent = nip44.decrypt(e.content, conversationKey);
            setPosts((prev) => {
              if (!prev.find((p) => p.id === e.id)) {
                return [...prev, { ...e, decryptedContent }];
              }
              return prev;
            });
          } catch (error) {
            console.error('Decryption failed:', error);
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
        {setPosts && Array.isArray(setPosts) && setPosts.map((post) => (
          <li key={post.id}>
            <strong>{post.pubkey.slice(0, 8)}...</strong>: {post.decryptedContent || 'Decrypting...'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostList;