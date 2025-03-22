import React from "react";
import { Event, nip19 } from "nostr-tools";

type DecryptedEvent = Event & { decryptedContent?: string };

interface PostCardProps {
  post: DecryptedEvent;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const npub = nip19.npubEncode(post.pubkey);
  const shortNpub = `${npub.substring(0, 8)}...${npub.substring(npub.length - 4)}`;

  const timestamp = new Date(post.created_at * 1000);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {post.pubkey.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-medium text-gray-800">{shortNpub}</div>
          <div className="text-xs text-gray-500">{timeAgo}</div>
        </div>
      </div>

      <div className="text-gray-800 whitespace-pre-wrap break-words">
        {post.decryptedContent || <div className="text-gray-400 italic">Decrypting post...</div>}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-4 text-gray-500 text-sm">
        <button className="flex items-center space-x-1 hover:text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span>Like</span>
        </button>

        <button className="flex items-center space-x-1 hover:text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
              clipRule="evenodd"
            />
          </svg>
          <span>Comment</span>
        </button>

        <button className="flex items-center space-x-1 hover:text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (now.getFullYear() !== timestamp.getFullYear()) {
    options.year = "numeric";
  }

  return timestamp.toLocaleDateString(undefined, options);
}

export default PostCard;
