/* Foundry — static data: fonts, pairings, ratios, palettes, timeline */
window.F = window.F || {};

/* Google Fonts (loaded on demand) + system stacks (always available, work offline) */
F.FONTS = [
  { id: 'fraunces', name: 'Fraunces', g: 'Fraunces:ital,wght@0,100..900;1,100..900', cat: 'Serif', min: 100, max: 900, fb: 'Charter, Georgia, serif' },
  { id: 'playfair', name: 'Playfair Display', g: 'Playfair+Display:ital,wght@0,400..900;1,400..900', cat: 'Serif', min: 400, max: 900, fb: 'Didot, "Bodoni MT", Georgia, serif' },
  { id: 'ebgaramond', name: 'EB Garamond', g: 'EB+Garamond:ital,wght@0,400..800;1,400..800', cat: 'Serif', min: 400, max: 800, fb: '"Palatino Linotype", Palatino, Georgia, serif' },
  { id: 'cormorant', name: 'Cormorant Garamond', g: 'Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700', cat: 'Serif', min: 300, max: 700, fb: '"Palatino Linotype", Palatino, Georgia, serif' },
  { id: 'lora', name: 'Lora', g: 'Lora:ital,wght@0,400..700;1,400..700', cat: 'Serif', min: 400, max: 700, fb: 'Charter, Georgia, serif' },
  { id: 'librebask', name: 'Libre Baskerville', g: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400', cat: 'Serif', min: 400, max: 700, fb: 'Baskerville, "Baskerville Old Face", Georgia, serif' },
  { id: 'dmserif', name: 'DM Serif Display', g: 'DM+Serif+Display:ital@0;1', cat: 'Display', min: 400, max: 400, fb: 'Georgia, serif' },
  { id: 'abril', name: 'Abril Fatface', g: 'Abril+Fatface', cat: 'Display', min: 400, max: 400, fb: 'Didot, Georgia, serif' },
  { id: 'robotoslab', name: 'Roboto Slab', g: 'Roboto+Slab:wght@100..900', cat: 'Slab', min: 100, max: 900, fb: 'Rockwell, "DejaVu Serif", serif' },
  { id: 'inter', name: 'Inter', g: 'Inter:wght@100..900', cat: 'Sans', min: 100, max: 900, fb: '"Helvetica Neue", Arial, sans-serif' },
  { id: 'worksans', name: 'Work Sans', g: 'Work+Sans:ital,wght@0,100..900;1,100..900', cat: 'Sans', min: 100, max: 900, fb: '"Helvetica Neue", Arial, sans-serif' },
  { id: 'montserrat', name: 'Montserrat', g: 'Montserrat:ital,wght@0,100..900;1,100..900', cat: 'Sans', min: 100, max: 900, fb: 'Avenir, "Century Gothic", sans-serif' },
  { id: 'spacegrotesk', name: 'Space Grotesk', g: 'Space+Grotesk:wght@300..700', cat: 'Sans', min: 300, max: 700, fb: '"Helvetica Neue", Arial, sans-serif' },
  { id: 'syne', name: 'Syne', g: 'Syne:wght@400..800', cat: 'Display', min: 400, max: 800, fb: '"Arial Black", sans-serif' },
  { id: 'anton', name: 'Anton', g: 'Anton', cat: 'Display', min: 400, max: 400, fb: 'Impact, "Arial Narrow Bold", sans-serif' },
  { id: 'bebas', name: 'Bebas Neue', g: 'Bebas+Neue', cat: 'Display', min: 400, max: 400, fb: 'Impact, "Arial Narrow Bold", sans-serif' },
  { id: 'archivoblack', name: 'Archivo Black', g: 'Archivo+Black', cat: 'Display', min: 400, max: 400, fb: '"Arial Black", sans-serif' },
  { id: 'plexmono', name: 'IBM Plex Mono', g: 'IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,400', cat: 'Mono', min: 100, max: 700, fb: 'ui-monospace, Menlo, Consolas, monospace' },
  { id: 'jetbrains', name: 'JetBrains Mono', g: 'JetBrains+Mono:ital,wght@0,100..800;1,100..800', cat: 'Mono', min: 100, max: 800, fb: 'ui-monospace, Menlo, Consolas, monospace' },

  { id: 'sys-ui', name: 'System UI', sys: true, cat: 'System', min: 100, max: 900, stack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  { id: 'sys-grotesk', name: 'Neo-Grotesque', sys: true, cat: 'System', min: 300, max: 900, stack: '"Helvetica Neue", Helvetica, Arial, "Nimbus Sans", "Liberation Sans", sans-serif' },
  { id: 'sys-humanist', name: 'Humanist Sans', sys: true, cat: 'System', min: 300, max: 800, stack: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", sans-serif' },
  { id: 'sys-industrial', name: 'Industrial', sys: true, cat: 'System', min: 300, max: 800, stack: 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif' },
  { id: 'sys-transitional', name: 'Transitional Serif', sys: true, cat: 'System', min: 400, max: 700, stack: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif' },
  { id: 'sys-oldstyle', name: 'Old-Style Serif', sys: true, cat: 'System', min: 400, max: 700, stack: '"Iowan Old Style", "Palatino Linotype", Palatino, "URW Palladio L", P052, serif' },
  { id: 'sys-didone', name: 'Didone', sys: true, cat: 'System', min: 400, max: 700, stack: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' },
  { id: 'sys-mono', name: 'Monospace', sys: true, cat: 'System', min: 300, max: 700, stack: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace' }
];
F.FONT_MAP = {};
F.FONTS.forEach(function (f) { F.FONT_MAP[f.id] = f; });

F.PAIRINGS = [
  { h: 'fraunces', b: 'inter', name: 'The Editor', note: 'Soft serif swagger, no-nonsense body.' },
  { h: 'anton', b: 'ebgaramond', name: 'Tabloid & Tweed', note: 'Shouts the headline, whispers the essay.' },
  { h: 'playfair', b: 'worksans', name: 'Gallery Opening', note: 'Champagne in the head, sensible shoes below.' },
  { h: 'spacegrotesk', b: 'plexmono', name: 'Mission Control', note: 'For changelogs with feelings.' },
  { h: 'bebas', b: 'lora', name: 'Fight Poster', note: 'Tall caps, warm paragraphs.' },
  { h: 'abril', b: 'montserrat', name: 'Fashion Week', note: 'Hairlines and attitude.' },
  { h: 'syne', b: 'spacegrotesk', name: 'Art School', note: 'Wide, weird, wonderful.' },
  { h: 'archivoblack', b: 'librebask', name: 'Broadsheet', note: 'Bold verdicts, classical reasoning.' },
  { h: 'robotoslab', b: 'inter', name: 'Field Manual', note: 'Sturdy as a workbench.' },
  { h: 'cormorant', b: 'montserrat', name: 'Wedding Invite', note: 'Elegant without the seating chart.' },
  { h: 'dmserif', b: 'jetbrains', name: 'Literary Hacker', note: 'Footnotes in monospace.' },
  { h: 'sys-industrial', b: 'sys-transitional', name: 'Offline Press', note: 'System fonts only — works on a plane.' },
  { h: 'sys-didone', b: 'sys-humanist', name: 'Offline Vogue', note: 'System fonts only, still dressed up.' }
];

F.RATIOS = [
  { v: '1.067', n: 'Minor second' },
  { v: '1.125', n: 'Major second' },
  { v: '1.2', n: 'Minor third' },
  { v: '1.25', n: 'Major third' },
  { v: '1.333', n: 'Perfect fourth' },
  { v: '1.414', n: 'Augmented fourth' },
  { v: '1.5', n: 'Perfect fifth' },
  { v: '1.618', n: 'Golden ratio' }
];

F.PALETTES = [
  { n: 'Newsprint', fg: '111111', bg: 'f4efe6' },
  { n: 'Swiss Red', fg: 'ffffff', bg: 'd7001f' },
  { n: 'Letterpress', fg: '2a211b', bg: 'efe5cf' },
  { n: 'Riso Blue', fg: '1d3fa6', bg: 'f8f1e7' },
  { n: 'Night Press', fg: 'ffd400', bg: '111111' },
  { n: 'Blueprint', fg: 'f2f6ff', bg: '1f4ea8' },
  { n: 'Moss', fg: 'f3f0e2', bg: '2f4a3a' },
  { n: 'Too Subtle', fg: 'b8b3a8', bg: 'f4efe6' }
];

F.ERAS = ['All', 'Origins', 'Renaissance', 'Industry', 'Modernism', 'Digital'];

F.TIMELINE = [
  { y: 'c. 1040', era: 'Origins', t: 'Clay movable type', d: 'In Song-dynasty China, Bi Sheng makes movable type from baked clay — described by the scholar Shen Kuo in his Dream Pool Essays.', f: 'sys-oldstyle' },
  { y: '1377', era: 'Origins', t: 'Jikji', d: 'A Korean Buddhist text, Jikji, is printed with movable metal type. It is the oldest surviving book printed this way.', f: 'sys-oldstyle' },
  { y: 'c. 1450s', era: 'Origins', t: 'Gutenberg’s press', d: 'In Mainz, Johannes Gutenberg combines cast metal type, oil-based ink and a press. His 42-line Bible is completed around 1455.', f: 'ebgaramond' },
  { y: '1470', era: 'Origins', t: 'Jenson’s roman', d: 'Nicolas Jenson prints in Venice with a roman type so even and readable that it becomes a model for centuries of revivals.', f: 'ebgaramond' },
  { y: '1501', era: 'Renaissance', t: 'The first italic', d: 'Aldus Manutius publishes a small-format Virgil set in an italic type cut by Francesco Griffo — compact type for portable books.', f: 'cormorant' },
  { y: '1530s–1561', era: 'Renaissance', t: 'Claude Garamond', d: 'The Paris punchcutter Garamond cuts influential roman types. Fun twist: several later “Garamond” revivals were actually based on types by Jean Jannon.', f: 'ebgaramond' },
  { y: '1734', era: 'Industry', t: 'Caslon’s specimen', d: 'William Caslon issues his famous specimen sheet in London. His sturdy types became a standard across Britain and its colonies.', f: 'librebask' },
  { y: '1757', era: 'Industry', t: 'Baskerville’s Virgil', d: 'In Birmingham, John Baskerville publishes his Virgil: sharper, higher-contrast letters on unusually smooth paper with deep black ink.', f: 'librebask' },
  { y: '1816', era: 'Industry', t: 'Sans serif appears', d: 'William Caslon IV shows what is generally considered the first sans-serif printing type in a foundry specimen.', f: 'sys-grotesk' },
  { y: '1818', era: 'Industry', t: 'Manuale Tipografico', d: 'Giambattista Bodoni’s great type specimen is published by his widow after his death. Bodoni and the Didot family define the high-contrast “Didone” style.', f: 'playfair' },
  { y: '1886', era: 'Industry', t: 'Linotype', d: 'Ottmar Mergenthaler’s hot-metal line-casting machine goes to work at the New-York Tribune, setting whole lines of type at once.', f: 'robotoslab' },
  { y: '1898', era: 'Industry', t: 'Akzidenz-Grotesk', d: 'The Berthold foundry in Berlin releases Akzidenz-Grotesk — a workhorse sans that later became a favourite of Swiss designers.', f: 'sys-grotesk' },
  { y: '1916', era: 'Modernism', t: 'Underground lettering', d: 'Edward Johnston designs a clear sans-serif alphabet for the London Underground, still the ancestor of its signage today.', f: 'sys-humanist' },
  { y: '1927', era: 'Modernism', t: 'Futura', d: 'Paul Renner’s geometric Futura is released by the Bauer Type Foundry — circles, triangles and squares turned into letters.', f: 'montserrat' },
  { y: '1928', era: 'Modernism', t: 'The New Typography', d: 'Jan Tschichold publishes Die neue Typographie, arguing for asymmetric, functional layouts. The same year Monotype releases Eric Gill’s Gill Sans.', f: 'worksans' },
  { y: '1932', era: 'Modernism', t: 'Times New Roman', d: 'The Times of London debuts a new text face, supervised by Stanley Morison and drawn by Victor Lardent.', f: 'sys-transitional' },
  { y: '1957', era: 'Modernism', t: 'The Swiss year', d: 'Neue Haas Grotesk by Max Miedinger and Eduard Hoffmann appears (renamed Helvetica in 1960), as does Adrian Frutiger’s Univers.', f: 'inter' },
  { y: '1984', era: 'Digital', t: 'Pixels get personality', d: 'The Apple Macintosh ships with bitmap fonts designed by Susan Kare, putting typeface choice on ordinary desks.', f: 'plexmono' },
  { y: '1985', era: 'Digital', t: 'Desktop publishing', d: 'The Apple LaserWriter with Adobe PostScript, plus Aldus PageMaker, turns a desk into a print shop.', f: 'spacegrotesk' },
  { y: '1991', era: 'Digital', t: 'TrueType', d: 'Apple introduces TrueType outline fonts with System 7; Microsoft adopts the format for Windows 3.1 the following year.', f: 'jetbrains' },
  { y: '1996', era: 'Digital', t: 'Fonts for screens', d: 'Matthew Carter’s Verdana and Georgia are released by Microsoft — typefaces designed first for the pixel grid, not paper.', f: 'sys-transitional' },
  { y: '2010', era: 'Digital', t: 'Web fonts go mainstream', d: 'Google launches its free font API with a small library. WOFF becomes a W3C Recommendation in 2012.', f: 'worksans' },
  { y: '2016', era: 'Digital', t: 'Variable fonts', d: 'OpenType Font Variations are announced jointly by Adobe, Apple, Google and Microsoft: one file, a whole continuum of weights and widths.', f: 'fraunces' }
];

F.JOKES = [
  'Keming (n.): the result of improper kerning.',
  'Comic Sans walks into a bar. The bartender says, “We don’t serve your type.”',
  'I’d tell you a joke about leading, but it needs more space.',
  'Serif: a sans that went to finishing school.',
  'Widows and orphans: not a sad story, just a bad paragraph.',
  'Our tracking is so good, it found your lost keys.',
  'Monospace: every letter gets the same size flat. Very fair. Very cramped for the W.',
  'Never stretch type. It has done nothing to deserve this.'
];

F.GAME_WORDS = ['Hamburgefonstiv', 'Quizzical Jabs', 'Glyph & Grace', 'Rag, Rivers, Widows', 'Kerning Matters', 'Brave New Type', 'Ink on Paper', 'Bold Moves Only', 'Sphinx of Quartz', 'Letterpress'];
