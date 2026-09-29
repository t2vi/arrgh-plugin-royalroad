// Behavior tests, moved from arrgh's plugin-host/src/behavior.new-plugins.test.ts
// (ADR 0031 / 0034) when this plugin split into its own repo (spec 031 phase C).
// Fixtures are trimmed from live royalroad.com, 2026-09-25/26.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as royalroad from '../src/royalroad'

function mockFetch(responses: Record<string, { ok?: boolean; text?: string; json?: unknown }>) {
  return vi.fn().mockImplementation((url: string) => {
    const key = Object.keys(responses).find((k) => url.toString().includes(k))
    const resp = key ? responses[key] : { ok: false, text: '', json: {} }
    return Promise.resolve({
      ok: resp.ok ?? true,
      text: async () => resp.text ?? '',
      json: async () => resp.json ?? {},
    })
  })
}

beforeEach(() => { vi.clearAllMocks() })
afterEach(() => { vi.unstubAllGlobals() })

const RR_SEARCH_HTML = `
<div class="row fiction-list-item">
<figure class="col-sm-2 col-md-3 col-lg-2 text-center">
<a href="/fiction/36049/the-primal-hunter">
<img data-type="cover" onLoad="this.dataset.loaded = 1" alt="The Primal Hunter" src="https://www.royalroadcdn.com/public/covers-full/36049-the-primal-hunter.jpg?time=1641580443" />
</a>
</figure>
<div class="col-sm-10 col-md-8 col-lg-9 col-xs-12 search-content">
<h2 class="fiction-title">
<a href="/fiction/36049/the-primal-hunter" class="font-red-sunglo bold">The Primal Hunter</a>
</h2>
<div class="margin-bottom-10">
<span class="label label-default label-sm bg-blue-hoki">Original</span>
<span class="tags">
<a class="label label-default label-sm bg-blue-dark fiction-tag" href="/fictions/search?tagsAdd=litrpg">LitRPG</a>
<a class="label label-default label-sm bg-blue-dark fiction-tag" href="/fictions/search?tagsAdd=progression">Progression</a>
</span>
</div>
<div id="description-36049" class="margin-top-10 col-xs-12" style="display: none">
<p>On just another normal Monday, the world changed.</p>
<p>Perhaps… Jake was born for this kind of world, to begin with.</p>
</div>
</div>
</div>
`

const RR_FICTION_HTML = `
<html><head><meta property="books:author" content="Zogarth"/></head><body>
<div class="cover-art-container">
<img class="thumbnail inline-block" data-type="cover" alt="The Primal Hunter" src="https://www.royalroadcdn.com/public/covers-full/36049-the-primal-hunter.jpg?time=1641580443" />
</div>
<div class="description">
<input type="checkbox" value="" id="showMore"/>
<div class="hidden-content">
<p>On just another normal Monday, the world changed.</p>
</div>
</div>
<div class="tags"><a class="label fiction-tag">LitRPG</a><a class="label fiction-tag">Progression</a></div>
<table class="table no-border" id="chapters" data-chapters="3">
<tbody>
<tr data-url="/fiction/36049/the-primal-hunter/chapter/557051/chapter-1-another-monday-morning" class="chapter-row">
<td><a href="/fiction/36049/the-primal-hunter/chapter/557051/chapter-1-another-monday-morning">
Chapter 1 - Another Monday morning
</a></td>
<td class="text-right"><a href="/fiction/36049/the-primal-hunter/chapter/557051/chapter-1-another-monday-morning"><time>6 years</time> ago</a></td>
</tr>
<tr data-url="/fiction/36049/the-primal-hunter/chapter/557071/chapter-2-introduction" class="chapter-row">
<td><a href="/fiction/36049/the-primal-hunter/chapter/557071/chapter-2-introduction">
Chapter 2 - Introduction
</a></td>
</tr>
<tr data-url="/fiction/36049/the-primal-hunter/chapter/4008007/chapter-1389-antechamber" class="chapter-row">
<td><a href="/fiction/36049/the-primal-hunter/chapter/4008007/chapter-1389-antechamber">
Chapter 1389 - Antechamber
</a></td>
</tr>
</tbody>
</table>
</body></html>
`

const RR_FICTION_UNNUMBERED_HTML = `
<table id="chapters"><tbody>
<tr class="chapter-row"><td><a href="/fiction/1/x/chapter/10/prologue">Prologue</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/1/x/chapter/11/the-beginning">The Beginning</a></td></tr>
</tbody></table>
`

// Live 2026-09-26: fiction 29358 (Dungeon Crawler Carl Book 6, a STUB) — its full chapter table.
const RR_FICTION_LETTERED_HTML = `
<table id="chapters"><tbody>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/442507/chapter-1">Chapter 1</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/442714/chapter-2a">Chapter 2.A</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/442757/chapter-2b">Chapter 2.B</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/442823/chapter-2c">Chapter 2.C</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/996461/book-5-recap">Book 5 Recap</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/996463/book-6-prologue-chapter-198">Book 6, prologue (Chapter 198)</a></td></tr>
<tr class="chapter-row"><td><a href="/fiction/29358/dungeon-crawler-carl-book-6-the-ghosts-of-earth/chapter/996937/chapter-199">Chapter 199</a></td></tr>
</tbody></table>
`

const RR_CHAPTER_HTML = `
<html><head>
<style>
    .cjE2ZmJhOTE5NjU3ZDQ1NmFiYjQwNTRhMWMxMDAzYzk4{
        display: none;
        speak: never;
    }
</style>
</head><body>
<div class="chapter-inner chapter-content">
<p class="cnNlZDM3ZTI5ZjEzNjQxYzVhYmJlM2UwNzllY2JjZDU1">It was just another boring Monday morning.</p>
<span class="cjE2ZmJhOTE5NjU3ZDQ1NmFiYjQwNTRhMWMxMDAzYzk4"><br>The tale has been stolen; if detected on Amazon, report the violation.<br></span>
<p class="cnM2NDcwNjc3NjMxYzQxYmI5NTRkZTA4NzA4YjQxYWUy">Jake had always been a rather laid-back person.</p>
</div>
</body></html>
`

describe('royalroad', () => {
  describe('royalroad — search', () => {
    it('parses id, title, cover, description, tags', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: RR_SEARCH_HTML } }))
      const [r] = await royalroad.search('the primal hunter')
      expect(r.id).toBe('36049')
      expect(r.title).toBe('The Primal Hunter')
      expect(r.cover_url).toBe('https://www.royalroadcdn.com/public/covers-full/36049-the-primal-hunter.jpg?time=1641580443')
      expect(r.description).toContain('On just another normal Monday')
      expect(r.tags).toContain('LitRPG')
      expect(r.author).toBeNull()
    })

    it('throws on non-OK response', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com': { ok: false } }))
      await expect(royalroad.search('x')).rejects.toThrow()
    })

    // Live 2026-09-26: fictions without a cover (e.g. 186037 "The Arcane King")
    // serve src="/dist/img/nocover-new-min.png" — relative, and only a placeholder.
    it('no-cover placeholder → null cover_url', async () => {
      const html = RR_SEARCH_HTML.replace(/src="https:\/\/www\.royalroadcdn\.com[^"]*"/, 'src="/dist/img/nocover-new-min.png"')
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: html } }))
      const [r] = await royalroad.search('primal hunter')
      expect(r.cover_url).toBeNull()
    })

    it('other relative cover paths are made absolute', async () => {
      const html = RR_SEARCH_HTML.replace(/src="https:\/\/www\.royalroadcdn\.com[^"]*"/, 'src="/covers/36049.jpg"')
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: html } }))
      const [r] = await royalroad.search('primal hunter')
      expect(r.cover_url).toBe('https://www.royalroad.com/covers/36049.jpg')
    })

    // GH arrgh#255: royalroad.com's own search matches loosely (likely across
    // description/tags too) — a query full of common words returned a page of
    // unrelated fictions instead of few/none. Filter to title-relevant results.
    it('filters out a result whose title does not relate to a common-word query', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: RR_SEARCH_HTML } }))
      const results = await royalroad.search('I Have a Task Log')
      expect(results).toHaveLength(0)
    })

    it('keeps a result whose title contains every significant query word', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: RR_SEARCH_HTML } }))
      const results = await royalroad.search('primal hunter')
      expect(results).toHaveLength(1)
    })

    it('keeps everything when the query is entirely stopwords (nothing to filter on)', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'royalroad.com/fictions/search': { text: RR_SEARCH_HTML } }))
      const results = await royalroad.search('the a of')
      expect(results).toHaveLength(1)
    })
  })

  describe('royalroad — meta', () => {
    it('no-cover placeholder → null cover_url', async () => {
      const html = RR_FICTION_HTML.replace(/src="https:\/\/www\.royalroadcdn\.com[^"]*"/, 'src="/dist/img/nocover-new-min.png"')
      vi.stubGlobal('fetch', mockFetch({ '/fiction/36049': { text: html } }))
      expect((await royalroad.meta('36049')).cover_url).toBeNull()
    })

    it('reads author from books:author meta, plus description and cover', async () => {
      vi.stubGlobal('fetch', mockFetch({ '/fiction/36049': { text: RR_FICTION_HTML } }))
      const m = await royalroad.meta('36049')
      expect(m.author).toBe('Zogarth')
      expect(m.description).toContain('On just another normal Monday')
      expect(m.cover_url).toContain('royalroadcdn.com')
      expect(m.tags).toContain('LitRPG')
    })
  })

  describe('royalroad — chapters', () => {
    it('numbers stub chapters by their real number, not position', async () => {
      vi.stubGlobal('fetch', mockFetch({ '/fiction/36049': { text: RR_FICTION_HTML } }))
      const chs = await royalroad.chapters('36049')
      expect(chs.map((c) => c.number)).toEqual([1, 2, 1389])
      for (const c of chs) {
        expect(c.chapter_format).toBe('text')
        expect(c.source_id.startsWith('fiction/36049/')).toBe(true)
      }
    })

    // Lettered parts ("Chapter 2.A/B/C") used to all parse as 2 and collapse into one
    // chapter (chapters dedup by number); an unnumbered entry took its list position (5),
    // which can collide with a real chapter 5. 7 chapters became 5.
    it('keeps lettered parts and unnumbered entries distinct and in order', async () => {
      vi.stubGlobal('fetch', mockFetch({ '/fiction/29358': { text: RR_FICTION_LETTERED_HTML } }))
      const chs = await royalroad.chapters('29358')
      expect(chs.map((c) => c.number)).toEqual([1, 2.1, 2.2, 2.3, 2.31, 198, 199])
      expect(new Set(chs.map((c) => c.number)).size).toBe(7)
    })

    it('falls back to 1-based position when no number parses', async () => {
      vi.stubGlobal('fetch', mockFetch({ '/fiction/1': { text: RR_FICTION_UNNUMBERED_HTML } }))
      const chs = await royalroad.chapters('1')
      expect(chs.map((c) => c.number)).toEqual([1, 2])
    })
  })

  describe('royalroad — chapterText', () => {
    it('returns chapter markdown', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'chapter/557051': { text: RR_CHAPTER_HTML } }))
      const md = await royalroad.chapterText('fiction/36049/the-primal-hunter/chapter/557051/chapter-1-another-monday-morning')
      expect(md).toContain('It was just another boring Monday morning.')
      expect(md).toContain('Jake had always been a rather laid-back person.')
    })

    it('strips hidden anti-piracy lines (class hidden via inline <style>)', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'chapter/557051': { text: RR_CHAPTER_HTML } }))
      const md = await royalroad.chapterText('fiction/36049/the-primal-hunter/chapter/557051/chapter-1-another-monday-morning')
      expect(md).not.toContain('Amazon')
    })

    it('throws when chapter content is absent', async () => {
      vi.stubGlobal('fetch', mockFetch({ 'chapter/1': { text: '<div></div>' } }))
      await expect(royalroad.chapterText('fiction/1/x/chapter/1/y')).rejects.toThrow()
    })
  })
})
