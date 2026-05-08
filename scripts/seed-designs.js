#!/usr/bin/env node
/**
 * DRIPRANK — Design Image Seeder
 * Uploads every image in /designs to Supabase Storage and
 * updates the existing DR001-DR010 design records with the new URLs.
 * Any extra images become new design entries.
 */

import { readdir, readFile } from 'fs/promises'
import { extname, basename, join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()
config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing VITE_SUPABASE_URL or key in .env')
  process.exit(1)
}

const supabase     = createClient(SUPABASE_URL, SUPABASE_KEY)
const DESIGNS_DIR  = join(process.cwd(), 'designs')
const ALLOWED      = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg'])

function mimeFor(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.png': 'image/png',  '.webp': 'image/webp',
                '.svg': 'image/svg+xml' }
  return map[ext] ?? 'application/octet-stream'
}

async function run() {
  // 1. Get all image files
  const all = await readdir(DESIGNS_DIR)
  const files = all.filter(f => ALLOWED.has(extname(f).toLowerCase()))

  if (!files.length) { console.log('No images found in /designs'); return }
  console.log(`📁  ${files.length} image(s) found\n`)

  // 2. Get existing designs ordered by rank
  const { data: designs, error: dErr } = await supabase
    .from('designs')
    .select('id, name, rank')
    .eq('source', 'system')
    .order('rank', { ascending: true })
  if (dErr) { console.error('❌  DB read failed:', dErr.message); process.exit(1) }

  // 3. Upload each image & collect public URL
  const uploaded = []
  for (const file of files) {
    const ext      = extname(file).toLowerCase()
    const safeName = Buffer.from(file).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 40)
    const path     = `system/${safeName}${ext}`

    console.log(`⬆️   Uploading: ${file}`)
    const buf = await readFile(join(DESIGNS_DIR, file))

    const { data, error } = await supabase.storage
      .from('designs')
      .upload(path, buf, { contentType: mimeFor(ext), upsert: true })

    if (error) { console.error(`  ❌  Storage error: ${error.message}`); continue }

    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(data.path)

    uploaded.push(publicUrl)
    console.log(`  ✅  ${publicUrl}\n`)
  }

  if (!uploaded.length) { console.log('Nothing uploaded.'); return }

  // 4. Update existing designs with new image URLs (round-robin if fewer images than designs)
  for (let i = 0; i < designs.length; i++) {
    const imageUrl = uploaded[i % uploaded.length]
    const { error } = await supabase
      .from('designs')
      .update({ image: imageUrl })
      .eq('id', designs[i].id)
    if (error) {
      console.error(`❌  Update ${designs[i].id} failed:`, error.message)
    } else {
      console.log(`✅  ${designs[i].id} (${designs[i].name}) → image updated`)
    }
  }

  // 5. If more images than designs, insert new entries for the extras
  const extras = uploaded.slice(designs.length)
  for (let i = 0; i < extras.length; i++) {
    const id = `UP${Date.now()}${i}`
    const { error } = await supabase.from('designs').insert({
      id,
      name:            `DESIGN ${i + 1}`,
      designer:        '@system',
      color:           ['#B6FF00','#00D1FF','#FF006E'][i % 3],
      hype:            '🔥',
      rank:            99,
      prev_rank:       99,
      orders:          0,
      weekly_orders:   0,
      all_time_orders: 0,
      visibility:      'public',
      drop:            false,
      image:           extras[i],
      source:          'system',
    })
    if (error) console.error(`❌  Insert extra ${id}:`, error.message)
    else       console.log(`✅  Inserted new design ${id}`)
  }

  console.log('\n🎉  Seed complete.')
}

run().catch(e => { console.error(e); process.exit(1) })
