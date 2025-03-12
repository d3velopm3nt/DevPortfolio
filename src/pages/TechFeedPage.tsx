import React, { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  Library,
  Code2,
  BookOpen,
  Newspaper,
  Filter,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Technology } from "../types";
import { TechFeedPost } from "../components/tech/TechFeedPost";

interface TechFeedPost {
  id: string;
  title: string;
  content: string;
  type: "article" | "tutorial" | "news" | "resource";
  created_at: string;
  user: {
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
  info_blocks: Array<{
    id: string;
    title: string;
    description: string | null;
    type: "code" | "image" | "link" | "text" | "resource";
    order_index: number;
    items: Array<{
      id: string;
      type: "text" | "image" | "link" | "code";
      content: string;
      order_index: number;
    }>;
  }>;
}

export function TechFeedPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<TechFeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTechs, setSelectedTechs] = useState<Technology[]>([]);
  const [availableTechs, setAvailableTechs] = useState<Technology[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchTechnologies();
  }, []);

  const fetchTechnologies = async () => {
    try {
      const { data, error } = await supabase
        .from("technologies")
        .select("*")
        .order("name");

      if (error) throw error;
      setAvailableTechs(data);
    } catch (err) {
      console.error("Error fetching technologies:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("tech_feed_posts")
        .select(
          `
          *,
          user:profiles(username, avatar_url),
          tech_feed_post_technologies(
            technologies(*)
          ),
          resource:resources(
            id,
            name,
            type,
            website_url,
            github_url
          ),
          info_blocks:tech_feed_post_info_blocks(
            id,
            title,
            description,
            type,
            order_index,
            items:tech_feed_post_info_items(
              id,
              type,
              content,
              order_index
            )
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (selectedTypes.length > 0) {
        query = query.in("type", selectedTypes);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(
        data.map((post) => ({
          ...post,
          technologies: post.tech_feed_post_technologies.map(
            (pt: any) => pt.technologies,
          ),
          info_blocks: post.info_blocks
            .map((block: any) => ({
              ...block,
              items: block.items.sort(
                (a: any, b: any) => a.order_index - b.order_index,
              ),
            }))
            .sort((a: any, b: any) => a.order_index - b.order_index),
        })),
      );
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load tech feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleTechToggle = (tech: Technology) => {
    setSelectedTechs((prev) =>
      prev.some((t) => t.name === tech.name)
        ? prev.filter((t) => t.name !== tech.name)
        : [...prev, tech],
    );
  };

  const filteredPosts = posts.filter((post) => {
    const matchesTechs =
      selectedTechs.length === 0 ||
      selectedTechs.every((selectedTech) =>
        post.technologies.some((tech) => tech.name === selectedTech.name),
      );

    return matchesTechs;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tech Feed
        </h1>
        <button
          onClick={() => navigate("/feed/create")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>

        {/* Post Types */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Post Types
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { type: "article", label: "Articles", icon: BookOpen },
              { type: "tutorial", label: "Tutorials", icon: Code2 },
              { type: "news", label: "News", icon: Newspaper },
              { type: "resource", label: "Resources", icon: Library },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTypes.includes(type)
                    ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Technologies */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTechs.map((tech) => (
              <button
                key={tech.name}
                onClick={() => handleTechToggle(tech)}
                className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5`}
              >
                {tech.name}
                <X className="w-3 h-3" />
              </button>
            ))}
            {availableTechs
              .filter(
                (tech) => !selectedTechs.some((t) => t.name === tech.name),
              )
              .map((tech) => (
                <button
                  key={tech.name}
                  onClick={() => handleTechToggle(tech)}
                  className={`${tech.color} opacity-60 hover:opacity-100 px-3 py-1.5 rounded-full text-sm`}
                >
                  {tech.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <TechFeedPost key={post.id} post={post} />
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No posts found. Try adjusting your filters or create a new post!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
