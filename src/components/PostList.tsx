import React, { useEffect } from "react";
import { Relay, getPublicKey, nip44, Event, nip19 } from "nostr-tools";
import { hexToBytes } from "@noble/hashes/utils";

type DecryptedEvent = Event & { decryptedContent?: string };

interface PostListProps {
  relay: Relay | null;
  friends: string[];
  setPosts: React.Dispatch<React.SetStateAction<DecryptedEvent[]>>;
  pubkey: string;
  viewKey: string;
  viewKeyMap: Map<string, string>;
  posts: DecryptedEvent[];
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
    if (!relay || !window.nostr) return;
    
    const friendsSub = relay.subscribe(
      [
        { kinds: [9876], authors: friends.length > 0 ? friends : [] },
      ],
      {
        onevent: async (e) => {
          try {
            const viewKeyHex = viewKeyMap.get(e.pubkey);
            if(!viewKeyHex) throw Error("FRIENDS KEY NOT FOUND IN VIEW KEY MAP");
            
            const UIntViewKey = hexToBytes(viewKeyHex);
            const conversationKey = nip44.getConversationKey(
              UIntViewKey,
              getPublicKey(UIntViewKey)
            );
            
            const decryptedContent = nip44.decrypt(e.content, conversationKey);
            
            setPosts((prev) => {
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

    const selfSub = relay.subscribe(
      [
        { kinds: [9876], authors: [pubkey] },
      ],
      {
        onevent: async (e) => {
          try {
            const UIntViewKey = hexToBytes(viewKey);
            const conversationKey = nip44.getConversationKey(
              UIntViewKey,
              getPublicKey(UIntViewKey)
            );
            
            const decryptedContent = nip44.decrypt(e.content, conversationKey);
            
            setPosts((prev) => {
              if (!prev.find((p) => p.id === e.id)) {
                return [...prev, { ...e, decryptedContent }];
              }
              return prev;
            });
          } catch (error) {
            console.error("Decryption of own post failed:", error);
          }
        },
      }
    );

    return () => {
      friendsSub.close();
      selfSub.close();
    };
  }, [relay, friends, setPosts, viewKey, pubkey, viewKeyMap]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Posts Feed</h2>
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No posts yet. Add friends or create a post to get started!</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {posts
            .sort((a, b) => b.created_at - a.created_at)
            .map((post) => (
              <li key={post.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {post.pubkey.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {post.pubkey === pubkey 
                        ? "You" 
                        : `${nip19.npubEncode(post.pubkey).slice(0, 8)}...`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(post.created_at * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-gray-800 mt-2 whitespace-pre-wrap">
                  {post.decryptedContent || "Decrypting..."}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-6 text-sm text-gray-500">
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Comment</span>
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default PostList;
