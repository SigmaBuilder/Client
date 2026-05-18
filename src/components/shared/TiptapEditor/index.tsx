import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, 
  Heading3, List, ListOrdered, Quote, Undo, Redo, ImageIcon, LinkIcon, UnlinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { MediaLibraryManager } from '../MediaLibrary/MediaLibraryManager';
import { MediaAsset } from '../MediaLibrary/MediaLibraryView';
import { useCallback, useState } from 'react';
import './tiptap.css';

interface TiptapEditorProps {
  value: any;
  onChange: (value: any) => void;
  projectId: string;
  siteId: string;
  className?: string;
}

const MenuBar = ({ editor, projectId, siteId }: { editor: any, projectId: string, siteId: string }) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) {
    return null;
  }

  const addImage = useCallback((asset: MediaAsset) => {
    if (asset.file_url) {
      editor.chain().focus().setImage({ src: asset.file_url }).run();
    }
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkDialogOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-background/95 backdrop-blur items-center sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-0.5 pr-2 border-r">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            title="Negrita"
            type="button"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            title="Cursiva"
            type="button"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-muted' : ''}
            title="Tachado"
            type="button"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={editor.isActive('code') ? 'bg-muted' : ''}
            title="Código"
            type="button"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            title="Título 1"
            type="button"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            title="Título 2"
            type="button"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            title="Título 3"
            type="button"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            title="Lista"
            type="button"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            title="Lista Numerada"
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            title="Cita"
            type="button"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5 px-2 border-r">
          <Button
            variant="ghost"
            size="sm"
            onClick={openLinkDialog}
            className={editor.isActive('link') ? 'bg-muted' : ''}
            title="Enlace"
            type="button"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="Quitar Enlace"
            type="button"
          >
            <UnlinkIcon className="w-4 h-4" />
          </Button>
          <MediaLibraryManager
            projectId={projectId}
            siteId={siteId}
            onSelect={addImage}
            trigger={
              <Button variant="ghost" size="sm" title="Insertar Imagen" type="button">
                <ImageIcon className="w-4 h-4" />
              </Button>
            }
          />
        </div>

        <div className="flex items-center gap-0.5 pl-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Deshacer"
            type="button"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Rehacer"
            type="button"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Link insertion dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insertar Enlace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL del enlace</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="button" onClick={applyLink}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export function TiptapEditor({ value, onChange, projectId, siteId, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: 'Escribe tu post aquí...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[500px] p-4 lg:p-8',
      },
    },
  });

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <MenuBar editor={editor} projectId={projectId} siteId={siteId} />
      <div className="flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
