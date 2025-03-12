import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Check,
  X,
  Library,
  Code2,
  Image as ImageIcon,
  Link as LinkIcon,
  BookOpen,
  Newspaper,
  GripVertical,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../lib/supabase";
import { Technology } from "../types";

interface Resource {
  id: string;
  name: string;
  type: string;
  website_url: string;
  github_url: string;
}

interface InfoBlock {
  id: string;
  title: string;
  description: string;
  type: "code" | "image" | "link" | "text" | "resource";
  items: Array<{
    id: string;
    type: "text" | "image" | "link" | "code";
    content: string;
  }>;
}

export function CreatePostPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isAddingResource, setIsAddingResource] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "article" as const,
    technologies: [] as string[],
    resource: null as string | null,
    info_blocks: [] as InfoBlock[],
  });

  const [resourceForm, setResourceForm] = useState({
    name: "",
    type: "library" as const,
    website_url: "",
    github_url: "",
    technologies: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [techResponse, resourcesResponse] = await Promise.all([
        supabase.from("technologies").select("*").order("name"),
        supabase.from("resources").select("*").order("name"),
      ]);

      if (techResponse.error) throw techResponse.error;
      if (resourcesResponse.error) throw resourcesResponse.error;

      setTechnologies(techResponse.data);
      setResources(resourcesResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load required data");
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: resource, error: resourceError } = await supabase
        .from("resources")
        .insert([
          {
            name: resourceForm.name,
            type: resourceForm.type,
            website_url: resourceForm.website_url,
            github_url: resourceForm.github_url,
          },
        ])
        .select()
        .single();

      if (resourceError) throw resourceError;

      if (resourceForm.technologies.length > 0) {
        const { error: techError } = await supabase
          .from("resource_technologies")
          .insert(
            resourceForm.technologies.map((techId) => ({
              resource_id: resource.id,
              technology_id: techId,
            })),
          );

        if (techError) throw techError;
      }

      await fetchData();
      setFormData((prev) => ({ ...prev, resource: resource.id }));
      setIsAddingResource(false);
    } catch (err) {
      console.error("Error creating resource:", err);
      setError("Failed to create resource");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create post
      const { data: post, error: postError } = await supabase
        .from("tech_feed_posts")
        .insert([
          {
            user_id: user.id,
            title: formData.title,
            content: formData.content,
            type: formData.type,
            resource_id: formData.resource,
          },
        ])
        .select()
        .single();

      if (postError) throw postError;

      // Add technologies
      if (formData.technologies.length > 0) {
        const { error: techError } = await supabase
          .from("tech_feed_post_technologies")
          .insert(
            formData.technologies.map((techId) => ({
              post_id: post.id,
              technology_id: techId,
            })),
          );

        if (techError) throw techError;
      }

      // Add info blocks
      for (let i = 0; i < formData.info_blocks.length; i++) {
        const block = formData.info_blocks[i];

        const { data: infoBlock, error: blockError } = await supabase
          .from("tech_feed_post_info_blocks")
          .insert([
            {
              post_id: post.id,
              title: block.title,
              description: block.description,
              type: block.type,
              order_index: i,
            },
          ])
          .select()
          .single();

        if (blockError) throw blockError;

        // Add items for this block
        if (block.items.length > 0) {
          const { error: itemsError } = await supabase
            .from("tech_feed_post_info_items")
            .insert(
              block.items.map((item, index) => ({
                block_id: infoBlock.id,
                type: item.type,
                content: item.content,
                order_index: index,
              })),
            );

          if (itemsError) throw itemsError;
        }
      }

      navigate("/feed");
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlock = () => {
    const newBlock: InfoBlock = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      type: "text",
      items: [],
    };

    setFormData((prev) => ({
      ...prev,
      info_blocks: [...prev.info_blocks, newBlock],
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    setFormData((prev) => ({
      ...prev,
      info_blocks: prev.info_blocks.filter((block) => block.id !== blockId),
    }));
  };

  const handleAddItem = (
    blockId: string,
    type: "text" | "image" | "link" | "code",
  ) => {
    setFormData((prev) => ({
      ...prev,
      info_blocks: prev.info_blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            items: [
              ...block.items,
              {
                id: crypto.randomUUID(),
                type,
                content: "",
              },
            ],
          };
        }
        return block;
      }),
    }));
  };

  const handleRemoveItem = (blockId: string, itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      info_blocks: prev.info_blocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            items: block.items.filter((item) => item.id !== itemId),
          };
        }
        return block;
      }),
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = Array.from(formData.info_blocks);
    const [removed] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, removed);

    setFormData((prev) => ({ ...prev, info_blocks: blocks }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/feed")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Feed
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Post
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {isAddingResource ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Resource
            </h2>
            <button
              onClick={() => setIsAddingResource(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateResource} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resource Name
              </label>
              <input
                type="text"
                value={resourceForm.name}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={resourceForm.type}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    type: e.target.value as "library" | "tool" | "framework",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="library">Library</option>
                <option value="tool">Tool</option>
                <option value="framework">Framework</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL
              </label>
              <input
                type="url"
                value={resourceForm.website_url}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    website_url: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={resourceForm.github_url}
                onChange={(e) =>
                  setResourceForm({
                    ...resourceForm,
                    github_url: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies
              </label>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => {
                      setResourceForm((prev) => ({
                        ...prev,
                        technologies: prev.technologies.includes(tech.id)
                          ? prev.technologies.filter((id) => id !== tech.id)
                          : [...prev.technologies, tech.id],
                      }));
                    }}
                    className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                      resourceForm.technologies.includes(tech.id)
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-80"
                    }`}
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAddingResource(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Create Resource
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Post Content */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Post Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { type: "article", label: "Article", icon: BookOpen },
                  { type: "tutorial", label: "Tutorial", icon: Code2 },
                  { type: "news", label: "News", icon: Newspaper },
                  { type: "resource", label: "Resource", icon: Library },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: type as any }))
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      formData.type === type
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {formData.type === "resource" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Resource
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingResource(true)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Add New Resource
                  </button>
                </div>
                <select
                  value={formData.resource || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resource: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required={formData.type === "resource"}
                >
                  <option value="">Select Resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies
              </label>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        technologies: prev.technologies.includes(tech.id)
                          ? prev.technologies.filter((id) => id !== tech.id)
                          : [...prev.technologies, tech.id],
                      }));
                    }}
                    className={`${tech.color} px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 ${
                      formData.technologies.includes(tech.id)
                        ? "opacity-100"
                        : "opacity-60 hover:opacity-80"
                    }`}
                  >
                    {tech.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info Blocks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Content Blocks
              </h2>
              <button
                type="button"
                onClick={handleAddBlock}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                <Plus className="w-5 h-5" />
                Add Block
              </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="info-blocks">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-6"
                  >
                    {formData.info_blocks.map((block, index) => (
                      <Draggable
                        key={block.id}
                        draggableId={block.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6"
                          >
                            <div className="flex items-start gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>

                              <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                  <input
                                    type="text"
                                    value={block.title}
                                    onChange={(e) => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        info_blocks: prev.info_blocks.map(
                                          (b) =>
                                            b.id === block.id
                                              ? { ...b, title: e.target.value }
                                              : b,
                                        ),
                                      }));
                                    }}
                                    placeholder="Block Title"
                                    className="text-lg font-medium bg-transparent border-none focus:outline-none text-gray-900 dark:text-white"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBlock(block.id)}
                                    className="p-1 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  value={block.description}
                                  onChange={(e) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      info_blocks: prev.info_blocks.map((b) =>
                                        b.id === block.id
                                          ? {
                                              ...b,
                                              description: e.target.value,
                                            }
                                          : b,
                                      ),
                                    }));
                                  }}
                                  placeholder="Block Description (optional)"
                                  className="w-full px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                />

                                <div className="space-y-4">
                                  {block.items.map((item, itemIndex) => (
                                    <div
                                      key={item.id}
                                      className="flex items-start gap-2"
                                    >
                                      {item.type === "text" ? (
                                        <textarea
                                          value={item.content}
                                          onChange={(e) => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              info_blocks: prev.info_blocks.map(
                                                (b) =>
                                                  b.id === block.id
                                                    ? {
                                                        ...b,
                                                        items: b.items.map(
                                                          (i, idx) =>
                                                            idx === itemIndex
                                                              ? {
                                                                  ...i,
                                                                  content:
                                                                    e.target
                                                                      .value,
                                                                }
                                                              : i,
                                                        ),
                                                      }
                                                    : b,
                                              ),
                                            }));
                                          }}
                                          placeholder="Enter text content..."
                                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                          rows={3}
                                        />
                                      ) : (
                                        <input
                                          type="text"
                                          value={item.content}
                                          onChange={(e) => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              info_blocks: prev.info_blocks.map(
                                                (b) =>
                                                  b.id === block.id
                                                    ? {
                                                        ...b,
                                                        items: b.items.map(
                                                          (i, idx) =>
                                                            idx === itemIndex
                                                              ? {
                                                                  ...i,
                                                                  content:
                                                                    e.target
                                                                      .value,
                                                                }
                                                              : i,
                                                        ),
                                                      }
                                                    : b,
                                              ),
                                            }));
                                          }}
                                          placeholder={
                                            item.type === "image"
                                              ? "Enter image URL..."
                                              : item.type === "link"
                                                ? "Enter link URL..."
                                                : "Enter code..."
                                          }
                                          className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                        />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveItem(block.id, item.id)
                                        }
                                        className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/50"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddItem(block.id, "text")
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Text
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddItem(block.id, "image")
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Image
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddItem(block.id, "link")
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Link
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleAddItem(block.id, "code")
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Code
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
