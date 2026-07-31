import { isSupabaseConfigured, requireSupabase, MEDIA_BUCKET } from '@/lib/supabase'
import { buildSeedSnapshot, seedRows, seedSettings } from './seed'
import {
  collectionKeys,
  tableFor,
  type CollectionKey,
  type CollectionMap,
  type ContentSnapshot,
  type Persisted,
  type SiteSettings,
} from './types'

export * from './types'
export * from './submissions'
export { buildSeedSnapshot, seedSettings } from './seed'

/**
 * The one place the site talks to storage.
 *
 * Every table is `(id uuid, sort_order int, updated_at timestamptz, data jsonb)`.
 * Keeping the domain object in a single `jsonb` column is deliberate: the admin
 * panel can add or rename a field on a programme without anyone writing a
 * migration, which is exactly the "no code required" guarantee the panel makes.
 */

type Row = { id: string; sort_order: number; updated_at?: string; data: Record<string, unknown> }

function toEntity<T extends object>(row: Row): Persisted<T> {
  return {
    ...(row.data as T),
    id: row.id,
    sort_order: row.sort_order,
    updated_at: row.updated_at,
  }
}

/** Strip the storage-only fields before writing back to `data`. */
function toPayload<T extends object>(entity: T): Record<string, unknown> {
  const { id: _id, sort_order: _s, updated_at: _u, ...rest } = entity as Record<string, unknown>
  return rest
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** Loads every collection plus settings in one pass. */
export async function loadSnapshot(): Promise<{ snapshot: ContentSnapshot; live: boolean }> {
  if (!isSupabaseConfigured) {
    return { snapshot: buildSeedSnapshot(), live: false }
  }

  const client = requireSupabase()
  const seedSnapshot = buildSeedSnapshot()

  const results = await Promise.all(
    collectionKeys.map(async (key) => {
      const { data, error } = await client
        .from(tableFor[key])
        .select('id, sort_order, updated_at, data')
        .order('sort_order', { ascending: true })

      if (error) throw new Error(`Failed to load ${key}: ${error.message}`)
      return [key, (data ?? []).map((row) => toEntity<object>(row as Row))] as const
    }),
  )

  const settings = await loadSettings()

  const snapshot = { ...seedSnapshot, settings } as ContentSnapshot
  for (const [key, rows] of results) {
    // An empty table means the admin has not seeded yet — fall back to the
    // bundled content so a fresh install never renders a blank page.
    if (rows.length > 0) {
      ;(snapshot as Record<string, unknown>)[key] = rows
    }
  }

  return { snapshot, live: true }
}

export async function loadSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return seedSettings

  const client = requireSupabase()
  const { data, error } = await client.from('site_settings').select('data').eq('id', 1).maybeSingle()

  if (error) throw new Error(`Failed to load settings: ${error.message}`)
  if (!data) return seedSettings
  return { ...seedSettings, ...(data.data as Partial<SiteSettings>) }
}

// ---------------------------------------------------------------------------
// Writes — admin only. Row-level security restricts these to authenticated users.
// ---------------------------------------------------------------------------

export async function createItem<K extends CollectionKey>(
  key: K,
  values: CollectionMap[K],
  sortOrder: number,
): Promise<Persisted<CollectionMap[K]>> {
  const client = requireSupabase()
  const { data, error } = await client
    .from(tableFor[key])
    .insert({ data: toPayload(values), sort_order: sortOrder })
    .select('id, sort_order, updated_at, data')
    .single()

  if (error) throw new Error(error.message)
  return toEntity<CollectionMap[K]>(data as Row)
}

export async function updateItem<K extends CollectionKey>(
  key: K,
  id: string,
  values: CollectionMap[K],
): Promise<Persisted<CollectionMap[K]>> {
  const client = requireSupabase()
  const { data, error } = await client
    .from(tableFor[key])
    .update({ data: toPayload(values), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, sort_order, updated_at, data')
    .single()

  if (error) throw new Error(error.message)
  return toEntity<CollectionMap[K]>(data as Row)
}

export async function deleteItem(key: CollectionKey, id: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.from(tableFor[key]).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Persists a drag-free reorder (move up / move down in the admin list). */
export async function reorderItems(key: CollectionKey, orderedIds: string[]): Promise<void> {
  const client = requireSupabase()
  const updates = orderedIds.map((id, index) =>
    client.from(tableFor[key]).update({ sort_order: index }).eq('id', id),
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export async function saveSettings(values: SiteSettings): Promise<SiteSettings> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('site_settings')
    .upsert({ id: 1, data: values, updated_at: new Date().toISOString() })
    .select('data')
    .single()

  if (error) throw new Error(error.message)
  return data.data as SiteSettings
}

/** Copies the bundled content into an empty database. Used once, from the admin dashboard. */
export async function seedDatabase(): Promise<Record<CollectionKey, number>> {
  const client = requireSupabase()
  const counts = {} as Record<CollectionKey, number>

  for (const key of collectionKeys) {
    const { count } = await client
      .from(tableFor[key])
      .select('id', { count: 'exact', head: true })

    if ((count ?? 0) > 0) {
      counts[key] = 0
      continue
    }

    const rows = seedRows[key].map((item, index) => ({ data: item, sort_order: index }))
    const { error } = await client.from(tableFor[key]).insert(rows)
    if (error) throw new Error(`Seeding ${key} failed: ${error.message}`)
    counts[key] = rows.length
  }

  await saveSettings(seedSettings)
  return counts
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/** Uploads an image and returns its public URL, ready to paste into any image field. */
export async function uploadImage(file: File): Promise<string> {
  const client = requireSupabase()

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safeStem = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
  const path = `${Date.now()}-${safeStem || 'image'}.${extension}`

  const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw new Error(error.message)

  const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function listImages(): Promise<{ name: string; url: string }[]> {
  const client = requireSupabase()
  const { data, error } = await client.storage
    .from(MEDIA_BUCKET)
    .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })

  if (error) throw new Error(error.message)
  return (data ?? [])
    .filter((f) => f.name !== '.emptyFolderPlaceholder')
    .map((f) => ({
      name: f.name,
      url: client.storage.from(MEDIA_BUCKET).getPublicUrl(f.name).data.publicUrl,
    }))
}

export async function deleteImage(name: string): Promise<void> {
  const client = requireSupabase()
  const { error } = await client.storage.from(MEDIA_BUCKET).remove([name])
  if (error) throw new Error(error.message)
}
