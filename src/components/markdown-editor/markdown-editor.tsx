"use client"

import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical"
import { $setBlocksType } from "@lexical/selection"
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text"
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  EditorState,
  $isElementNode,
} from "lexical"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
} from "lucide-react"

const theme = {
  heading: {
    h1: "text-4xl font-bold mb-4",
    h2: "text-3xl font-bold mb-3",
    h3: "text-2xl font-bold mb-2",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    code: "bg-grey-100 dark:bg-grey-800 px-1 py-0.5 rounded font-mono text-sm",
  },
  paragraph: "mb-2",
}

function onError(error: Error) {
  console.error(error)
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isCode, setIsCode] = useState(false)
  const [blockType, setBlockType] = useState<string>("paragraph")
  const [textAlign, setTextAlign] = useState<string>("left")

  const updateToolbar = () => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"))
      setIsItalic(selection.hasFormat("italic"))
      setIsUnderline(selection.hasFormat("underline"))
      setIsCode(selection.hasFormat("code"))

      // Get block type
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()
      
      if ($isHeadingNode(element)) {
        const tag = element.getTag()
        setBlockType(tag)
      } else if ($isElementNode(element)) {
        setBlockType(element.getType())
      } else {
        setBlockType("paragraph")
      }

      // Get text align
      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)
      if (elementDOM !== null) {
        const style = window.getComputedStyle(elementDOM)
        const align = style.textAlign || "left"
        setTextAlign(align)
      }
    }
  }

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar()
        return false
      },
      COMMAND_PRIORITY_CRITICAL
    )
  }, [editor])

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize))
      }
    })
  }

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode())
      }
    })
  }

  const formatText = (format: "bold" | "italic" | "underline" | "code") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatAlign = (align: "left" | "center" | "right") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode()
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow()
        const elementKey = element.getKey()
        const elementDOM = editor.getElementByKey(elementKey)
        if (elementDOM) {
          elementDOM.style.textAlign = align
          setTextAlign(align)
        }
      }
    })
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-grey-200 dark:border-grey-800 flex-wrap">
      {/* Heading Controls */}
      <div className="flex items-center gap-1 border-r border-grey-200 dark:border-grey-800 pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatHeading("h1")}
          className={cn(
            "h-8 w-8",
            blockType === "h1" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Heading 1"
        >
          <span className="text-sm font-bold">H1</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatHeading("h2")}
          className={cn(
            "h-8 w-8",
            blockType === "h2" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Heading 2"
        >
          <span className="text-sm font-bold">H2</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatHeading("h3")}
          className={cn(
            "h-8 w-8",
            blockType === "h3" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Heading 3"
        >
          <span className="text-sm font-bold">H3</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={formatParagraph}
          className={cn(
            "h-8 w-8",
            blockType === "paragraph" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Normal"
        >
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-1 border-r border-grey-200 dark:border-grey-800 pr-2 mr-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatText("bold")}
          className={cn(
            "h-8 w-8",
            isBold && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatText("italic")}
          className={cn(
            "h-8 w-8",
            isItalic && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatText("underline")}
          className={cn(
            "h-8 w-8",
            isUnderline && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatText("code")}
          className={cn(
            "h-8 w-8",
            isCode && "bg-grey-200 text-grey-900 dark:bg-grey-800"
          )}
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatAlign("left")}
          className={cn(
            "h-8 w-8",
            textAlign === "left" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatAlign("center")}
          className={cn(
            "h-8 w-8",
            textAlign === "center" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => formatAlign("right")}
          className={cn(
            "h-8 w-8",
            textAlign === "right" && "bg-grey-200 dark:bg-grey-800"
          )}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  readonly?: boolean
}

function ReadOnlyPlugin({ readonly }: { readonly: boolean }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.setEditable(!readonly)
  }, [editor, readonly])

  return null
}

function ValuePlugin({ value, onChange }: { value?: string; onChange?: (value: string) => void }) {
  const [editor] = useLexicalComposerContext()
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastValue, setLastValue] = useState(value)

  // Initialize editor with value on first load
  useEffect(() => {
    if (!isInitialized && value !== undefined) {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        
        if (value && value.trim()) {
          // Check if value is HTML (contains HTML tags)
          const isHTML = /<[a-z][\s\S]*>/i.test(value)
          
          if (isHTML) {
            // Parse HTML and generate nodes
            const parser = new DOMParser()
            const dom = parser.parseFromString(value, "text/html")
            const nodes = $generateNodesFromDOM(editor, dom)
            nodes.forEach(node => root.append(node))
          } else {
            // Plain text - create paragraph with text node
            const paragraph = $createParagraphNode()
            const textNode = $createTextNode(value)
            paragraph.append(textNode)
            root.append(paragraph)
          }
        } else {
          // Empty value - create empty paragraph
          const paragraph = $createParagraphNode()
          root.append(paragraph)
        }
      })
      setLastValue(value)
      setIsInitialized(true)
    }
  }, [value, editor, isInitialized])

  // Update editor when value prop changes (from outside)
  useEffect(() => {
    if (value !== lastValue && isInitialized) {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        
        if (value && value.trim()) {
          // Check if value is HTML (contains HTML tags)
          const isHTML = /<[a-z][\s\S]*>/i.test(value)
          
          if (isHTML) {
            // Parse HTML and generate nodes
            const parser = new DOMParser()
            const dom = parser.parseFromString(value, "text/html")
            const nodes = $generateNodesFromDOM(editor, dom)
            nodes.forEach(node => root.append(node))
          } else {
            // Plain text - create paragraph with text node
            const paragraph = $createParagraphNode()
            const textNode = $createTextNode(value)
            paragraph.append(textNode)
            root.append(paragraph)
          }
        } else {
          // Empty value - create empty paragraph
          const paragraph = $createParagraphNode()
          root.append(paragraph)
        }
      })
      setLastValue(value)
    }
  }, [value, editor, lastValue, isInitialized])

  // Handle editor changes and serialize to HTML
  useEffect(() => {
    if (!onChange || !isInitialized) return

    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        // Only update if it's different to avoid infinite loops
        if (htmlString !== lastValue) {
          setLastValue(htmlString)
          onChange(htmlString)
        }
      })
    })
  }, [editor, onChange, isInitialized, lastValue])

  return null
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  readonly = false,
}: MarkdownEditorProps) {
  const initialConfig = {
    namespace: "MarkdownEditor",
    theme,
    onError,
    nodes: [HeadingNode, QuoteNode],
    editorState: () => {
      const root = $getRoot()
      if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode()
        root.append(paragraph)
      }
    },
  }

  return (
    <div
      className={cn(
        "border border-grey-200 dark:border-grey-800 rounded-lg overflow-hidden",
        className
      )}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {!readonly && <ToolbarPlugin />}
        <ReadOnlyPlugin readonly={readonly} />
        <ValuePlugin value={value} onChange={onChange} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "min-h-[200px] p-4 outline-none prose text-grey-900 prose-sm max-w-none",
                  "dark:prose-invert",
                  readonly && "cursor-default"
                )}
              />
            }
            placeholder={
              !readonly ? (
                <div className="absolute top-4 left-4 text-grey-400 pointer-events-none">
                  {placeholder}
                </div>
              ) : null
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {!readonly && <HistoryPlugin />}
        </div>
      </LexicalComposer>
    </div>
  )
}
