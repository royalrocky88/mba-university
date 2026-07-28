import { useCallback, useEffect, useState } from 'react'
import { deleteImage, listImages, uploadImage } from '@/lib/repository'
import { useContent } from '@/context/ContentProvider'
import { Icon } from '@/components/ui/Icon'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

type MediaItem = { name: string; url: string }

/** Upload, browse, copy and delete images held in Supabase Storage. */
export function MediaLibrary() {
  const { live } = useContent()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  useDocumentTitle('Media library')

  const load = useCallback(async () => {
    if (!live) return
    setLoading(true)
    setError(null)
    try {
      setItems(await listImages())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not list images')
    } finally {
      setLoading(false)
    }
  }, [live])

  useEffect(() => {
    void load()
  }, [load])

  const upload = useCallback(
    async (files: FileList | File[]) => {
      const images = Array.from(files).filter((file) => file.type.startsWith('image/'))
      if (images.length === 0) return

      setUploading(true)
      setError(null)
      try {
        for (const file of images) await uploadImage(file)
        await load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [load],
  )

  async function onDelete(name: string) {
    setError(null)
    try {
      await deleteImage(name)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 1800)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-7">
        <h1 className="font-display text-3xl text-ink-900">Media library</h1>
        <p className="mt-1.5 text-[0.92rem] text-ink-900/60">
          Upload images once, then paste their URL into any image field across the site.
        </p>
      </header>

      {!live ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/8 px-5 py-4 text-[0.9rem] leading-relaxed text-ink-900/75">
          <strong className="font-semibold text-ink-900">Storage needs Supabase.</strong> Add your
          project URL and anon key to <code className="rounded bg-ink-900/8 px-1.5 py-0.5">.env.local</code>,
          run <code className="rounded bg-ink-900/8 px-1.5 py-0.5">supabase/schema.sql</code>, then reload.
        </div>
      ) : (
        <>
          {/* Dropzone */}
          <label
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              void upload(event.dataTransfer.files)
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
              dragging
                ? 'border-gold-500 bg-gold-500/8'
                : 'border-ink-900/15 bg-white/50 hover:border-gold-500/50',
              uploading && 'pointer-events-none opacity-60',
            )}
          >
            <Icon name="download" size={26} className="rotate-180 text-ink-900/35" />
            <span className="font-display text-[1.02rem] text-ink-900">
              {uploading ? 'Uploading…' : 'Drop images here, or choose files'}
            </span>
            <span className="text-[0.82rem] text-ink-900/50">
              JPG, PNG, WebP or SVG. Several at once is fine.
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                if (event.target.files) void upload(event.target.files)
                event.target.value = ''
              }}
            />
          </label>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3 text-[0.86rem] text-red-700">
              {error}
            </p>
          )}

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-ink-900">
                {items.length} {items.length === 1 ? 'image' : 'images'}
              </h2>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="rounded-lg border border-ink-900/12 px-3 py-1.5 text-[0.8rem] text-ink-900/65 transition-colors hover:bg-ink-900/5 disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-ink-900/15 py-14 text-center text-[0.9rem] text-ink-900/50">
                Nothing uploaded yet.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <li
                    key={item.name}
                    className="group overflow-hidden rounded-2xl border border-ink-900/10 bg-white/70"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink-900/5">
                      <img
                        src={item.url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3">
                      <p className="truncate text-[0.78rem] text-ink-900/60" title={item.name}>
                        {item.name}
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => void copy(item.url)}
                          className="flex-1 rounded-lg border border-ink-900/12 px-2 py-1.5 text-[0.74rem] text-ink-900/70 transition-colors hover:bg-ink-900/5"
                        >
                          {copied === item.url ? 'Copied' : 'Copy URL'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onDelete(item.name)}
                          aria-label={`Delete ${item.name}`}
                          className="grid size-8 shrink-0 place-items-center rounded-lg border border-red-500/25 text-red-600/70 transition-colors hover:bg-red-500/8"
                        >
                          <Icon name="close" size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
