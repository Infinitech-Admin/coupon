"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  ChevronDown,
  Type,
  Palette,
  Heading1,
  Heading2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/libs/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
}

const fontFamilies = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Tahoma", value: "Tahoma, sans-serif" },
];

const fontSizes = [
  { name: "Small", value: "12px" },
  { name: "Normal", value: "16px" },
  { name: "Medium", value: "18px" },
  { name: "Large", value: "24px" },
  { name: "X-Large", value: "32px" },
];

const colorOptions = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#444444" },
  { name: "Gray", value: "#888888" },
  { name: "Red", value: "#ff0000" },
  { name: "Blue", value: "#0000ff" },
  { name: "Green", value: "#008000" },
  { name: "Purple", value: "#800080" },
  { name: "Orange", value: "#ffa500" },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your message here...",
  className,
  minHeight = "200px",
  maxHeight = "400px",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, []);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;

      onChange(content);
      setIsEmpty(content === "" || content === "<br>");
    }
  };

  // Format commands
  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Enter URL:");

    if (url) {
      execCommand("createLink", url);
    }
  };

  // Handle file upload for images
  const handleImageUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          execCommand("insertImage", event.target.result as string);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("border rounded-md flex flex-col", className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
        {/* Font Family Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 gap-1 px-2" size="sm" variant="ghost">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Font</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {fontFamilies.map((font) => (
              <DropdownMenuItem
                key={font.name}
                style={{ fontFamily: font.value }}
                onClick={() => execCommand("fontName", font.value)}
              >
                {font.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 gap-1 px-2" size="sm" variant="ghost">
              <span className="text-xs">Size</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size.name}
                style={{ fontSize: size.value }}
                onClick={() => {
                  // Convert px to font size (1-7)
                  const fontSize = Math.min(
                    7,
                    Math.max(1, Math.floor(Number.parseInt(size.value) / 6)),
                  );

                  execCommand("fontSize", fontSize.toString());
                }}
              >
                {size.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Heading Styles */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-8 gap-1 px-2" size="sm" variant="ghost">
              <Heading1 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => execCommand("formatBlock", "h1")}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand("formatBlock", "h2")}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => execCommand("formatBlock", "p")}>
              <Type className="h-4 w-4 mr-2" /> Paragraph
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  className="w-full h-8 rounded border flex items-center justify-center hover:opacity-80"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => execCommand("foreColor", color.value)}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Basic Formatting */}
        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("bold")}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("italic")}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("underline")}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Alignment */}
        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyLeft")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyCenter")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("justifyRight")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Lists */}
        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={() => execCommand("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Links and Images */}
        <Button
          className="h-8 w-8 p-0"
          size="sm"
          variant="ghost"
          onClick={insertLink}
        >
          <Link className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button
            className="h-8 w-8 p-0"
            size="sm"
            variant="ghost"
            onClick={() => {
              const input = document.createElement("input");

              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => handleImageUpload(e);
              input.click();
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1">
        <div
          dangerouslySetInnerHTML={{ __html: value }}
          ref={editorRef}
          contentEditable
          className={cn(
            "w-full h-full p-3 overflow-auto focus:outline-none",
            isFocused ? "ring-2 ring-ring ring-offset-1" : "",
          )}
          style={{
            minHeight,
            maxHeight,
          }}
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onInput={handleInput}
        />
        {isEmpty && (
          <div className="absolute top-0 left-0 p-3 text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
