import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Newspaper,
  Library,
  ChevronDown,
  ChevronUp,
  Globe,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import { Technology } from "../../types";
import { useAuthStore } from "../../store/authStore";

interface InfoItem {
  id: string;
  type: "text" | "image" | "link" | "code";
  content: string;
  order_index: number;
}

interface InfoBlock {
  id: string;
  title: string;
  description: string | null;
  type: "code" | "image" | "link" | "text" | "resource";
  order_index: number;
  items: InfoItem[];
}

interface TechFeedPostProps {
  post: {
    id: string;
    title: string;
    content: string;
    type: "article" | "tutorial" | "news" | "resource";
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url: string;
    };
    technologies: Technology[];
    resource?: {
      id: string;
      name: string;
      type: string;
      website_url: string;
      github_url: string;
    };
    info_blocks: InfoBlock[];
  };
}

export function TechFeedPost({ post }: TechFeedPostProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getPostIcon = (type: string) => {
    switch (type) {
      case "article":
        return BookOpen;
      case "tutorial":
        return Code2;
      case "news":
        return Newspaper;
      case "resource":
        return Library;
      default:
        return BookOpen;
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "code":
        return Code2;
      case "image":
        return ImageIcon;
      case "link":
        return Globe;
      case "resource":
        return Library;
      default:
        return BookOpen;
    }
  };

  const PostIcon = getPostIcon(post.type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
              <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">
                {post.user.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {post.user.username}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                •
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <PostIcon className="w-4 h-4" />
                <span className="capitalize">{post.type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Technologies - Desktop */}
          <div className="hidden md:flex flex-wrap gap-2">
            {post.technologies.map((tech) => (
              <Link
                key={tech.name}
                to={`/technology/${encodeURIComponent(tech.name)}`}
                className={`${tech.color} px-2 py-1 rounded-full text-sm hover:opacity-80 transition-opacity`}
              >
                {tech.name}
              </Link>
            ))}
          </div>

          <button
            onClick={() => navigate(`/feed/edit/${post.id}`)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Technologies - Mobile */}
      <div className="flex md:hidden flex-wrap gap-2 mb-4">
        {post.technologies.map((tech) => (
          <Link
            key={tech.name}
            to={`/technology/${encodeURIComponent(tech.name)}`}
            className={`${tech.color} px-2 py-1 rounded-full text-sm hover:opacity-80 transition-opacity`}
          >
            {tech.name}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {post.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 mb-4">{post.content}</p>

      {/* Resource Card */}
      {post.resource && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Library className="w-5 h-5 text-gray-600 dark:text-gray-400" />

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {post.resource.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {post.resource.type}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            {post.resource.website_url && (
              <a
                href={post.resource.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Website
              </a>
            )}
            {post.resource.github_url && (
              <a
                href={post.resource.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      )}

      {/* Info Blocks */}
      {post.info_blocks.length > 0 && (
        <div className="mt-6 space-y-6">
          {post.info_blocks
            .slice(0, isExpanded ? undefined : 2)
            .map((block) => {
              const BlockIcon = getBlockIcon(block.type);
              return (
                <div key={block.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BlockIcon className="w-5 h-5 text-gray-500" />

                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {block.title}
                    </h3>
                  </div>
                  {block.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {block.description}
                    </p>
                  )}
                  <div className="space-y-3">
                    {block.items.map((item) => {
                      if (item.type === "text") {
                        return (
                          <p
                            key={item.id}
                            className="text-gray-600 dark:text-gray-300"
                          >
                            {item.content}
                          </p>
                        );
                      }
                      if (item.type === "image") {
                        return (
                          <img
                            key={item.id}
                            src={item.content}
                            alt=""
                            className="rounded-lg max-w-full h-auto"
                          />
                        );
                      }
                      if (item.type === "link") {
                        return (
                          <a
                            key={item.id}
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Globe className="w-4 h-4" />
                            {item.content}
                          </a>
                        );
                      }
                      if (item.type === "code") {
                        return (
                          <pre
                            key={item.id}
                            className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg overflow-x-auto"
                          >
                            <code className="text-sm text-gray-800 dark:text-gray-200">
                              {item.content}
                            </code>
                          </pre>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}

          {post.info_blocks.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show More ({post.info_blocks.length - 2} more blocks)
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
