import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface ReportEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const ReportEditor: React.FC<ReportEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div
        style={{
          borderBottom: '1px solid #ddd',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bold') ? '#007bff' : 'white',
            color: editor.isActive('bold') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('italic') ? '#007bff' : 'white',
            color: editor.isActive('italic') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('underline') ? '#007bff' : 'white',
            color: editor.isActive('underline') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('strike') ? '#007bff' : 'white',
            color: editor.isActive('strike') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          <s>S</s>
        </button>
        <div style={{ width: '1px', height: '32px', backgroundColor: '#ccc' }} />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('heading', { level: 1 }) ? '#007bff' : 'white',
            color: editor.isActive('heading', { level: 1 }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('heading', { level: 2 }) ? '#007bff' : 'white',
            color: editor.isActive('heading', { level: 2 }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('heading', { level: 3 }) ? '#007bff' : 'white',
            color: editor.isActive('heading', { level: 3 }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          H3
        </button>
        <div style={{ width: '1px', height: '32px', backgroundColor: '#ccc' }} />
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'left' }) ? '#007bff' : 'white',
            color: editor.isActive({ textAlign: 'left' }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          ⬅️
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'center' }) ? '#007bff' : 'white',
            color: editor.isActive({ textAlign: 'center' }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          ↔️
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'right' }) ? '#007bff' : 'white',
            color: editor.isActive({ textAlign: 'right' }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          ➡️
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive({ textAlign: 'justify' }) ? '#007bff' : 'white',
            color: editor.isActive({ textAlign: 'justify' }) ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          ⬌
        </button>
        <div style={{ width: '1px', height: '32px', backgroundColor: '#ccc' }} />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('bulletList') ? '#007bff' : 'white',
            color: editor.isActive('bulletList') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: editor.isActive('orderedList') ? '#007bff' : 'white',
            color: editor.isActive('orderedList') ? 'white' : 'black',
            cursor: 'pointer',
          }}
        >
          1.
        </button>
        <div style={{ width: '1px', height: '32px', backgroundColor: '#ccc' }} />
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          📊 Tabla
        </button>
        {editor.isActive('table') && (
          <>
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              + Col
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              + Fila
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              - Col
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              - Fila
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              style={{
                padding: '6px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#dc3545',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              🗑️ Tabla
            </button>
          </>
        )}
        <div style={{ width: '1px', height: '32px', backgroundColor: '#ccc' }} />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          style={{
            padding: '6px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          ↷
        </button>
      </div>

      {/* Editor Area - Tamaño carta */}
      <div
        style={{
          padding: '20px',
          minHeight: '500px',
          maxWidth: '816px', // 8.5 pulgadas a 96 DPI
          margin: '0 auto',
          backgroundColor: 'white',
        }}
      >
        <EditorContent
          editor={editor}
          style={{
            minHeight: '450px',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default ReportEditor;
