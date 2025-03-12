import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  Image,
  Type,
  Loader2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface InfoItem {
  id: string;
  type: "text" | "image" | "link";
  content: string;
  order_index: number;
}

interface InfoBlockEditorProps {
  items: InfoItem[];
  onChange: (items: InfoItem[]) => void;
  isLoading?: boolean;
}

export function InfoBlockEditor({
  items,
  onChange,
  isLoading = false,
}: InfoBlockEditorProps) {
  const [newItemType, setNewItemType] = useState<"text" | "image" | "link">(
    "text",
  );

  const handleAddItem = () => {
    const newItem: InfoItem = {
      id: crypto.randomUUID(),
      type: newItemType,
      content: "",
      order_index: items.length,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, content: string) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, content } : item)),
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Update order_index values
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order_index: index,
    }));

    onChange(updatedItems);
  };

  const getItemIcon = (type: "text" | "image" | "link") => {
    switch (type) {
      case "text":
        return Type;
      case "image":
        return Image;
      case "link":
        return LinkIcon;
    }
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="info-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => {
                const ItemIcon = getItemIcon(item.type);
                return (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-start gap-2 group"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab"
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <ItemIcon className="w-4 h-4 text-gray-500" />

                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {item.type}
                            </span>
                          </div>
                          {item.type === "text" ? (
                            <textarea
                              value={item.content}
                              onChange={(e) =>
                                handleItemChange(item.id, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              rows={3}
                            />
                          ) : (
                            <input
                              type="text"
                              value={item.content}
                              onChange={(e) =>
                                handleItemChange(item.id, e.target.value)
                              }
                              placeholder={
                                item.type === "image" ? "Image URL" : "Link URL"
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex items-center gap-4">
        <select
          value={newItemType}
          onChange={(e) =>
            setNewItemType(e.target.value as "text" | "image" | "link")
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="link">Link</option>
        </select>
        <button
          onClick={handleAddItem}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Item
        </button>
      </div>
    </div>
  );
}
