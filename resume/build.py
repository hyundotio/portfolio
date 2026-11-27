"""Builds the resume as HTML. Run ./build.sh to turn it into the PDF and page images.

Every line of text is placed by its baseline (in points, from the top of a
612 x 792 pt page), so edits here keep the original Figma layout: pick the line
breaks yourself and keep each body line under about 199pt wide.
Body text is Helvetica Neue (a macOS system font); everything else is IBM Plex Mono.
"""
import html, math
STY = {  # family, weight, size pt, letter-spacing em, baseline factor (calibrated against the Figma export)
    'head':   ['PlexMono', 600, 7.5, -0.0204, 0.295],
    'tag':    ['PlexMono', 600, 7.5, 0,       0.295],
    'sub':    ['PlexMono', 400, 7.5, -0.0204, 0.295],
    'side':   ['PlexMono', 500, 7.5, -0.0204, 0.295],
    'body':   ["'Helvetica Neue'", 400, 8, 0.0104, 0.36],
    'body0':  ["'Helvetica Neue'", 400, 8, 0,      0.36],
    'name':   ['PlexMono', 300, 33, -0.0204, 0.3605],
    'pageno': ['PlexMono', 300, 20, -0.0204, 0.375],
}
BLUE = '#0084ff'
L, R = 152, 384          # column x
LEAD = 35 / 3            # body line pitch. The Figma export snapped lines to whole points (11, 12, 12), which read as uneven.
H = lambda n: math.ceil(n * 35 / 3)
out = []
PG = [0]
def T(x, b, cls, s, href=None):
    c0 = cls.split()[0]
    # The Figma file sets the page-2 experience text with no tracking; kept as-is.
    if c0 == 'body' and PG[0] == 2 and b < 500: c0 = 'body0'; cls = 'body0'
    fam, wt, size, ls, k = STY[c0]
    inner = html.escape(s)
    if href: inner = f'<a href="{href}">{inner}</a>'
    out.append(f'<div class="t {cls}" style="transform:translate({x}pt,{b - k*size:.4f}pt)">{inner}</div>')
RECTS = []
def Rect(x, y, w, h, color='#000'):
    RECTS.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>')
def para(x, b, lines):
    for i, s in enumerate(lines): T(x, b + i * LEAD, 'body', s)
    return b + H(len(lines)) + 6
def paras(x, b, ps):
    for p in ps: b = para(x, b, p)
def col(x, b, items):
    for sub, lines in items:
        T(x, b, 'sub', sub)
        b = para(x, b + 13, lines)
def header(x, top, title, w):
    Rect(x, top, w, 1, BLUE); T(x, top + 11, 'head', title)
def company(top_b, l1, l2):
    Rect(L, top_b - 14, 16, 1); T(L, top_b, 'sub', l1); T(L, top_b + 13, 'sub', l2)
def chrome(n):
    T(26, 55, 'name', 'HYUN'); T(26, 86, 'name', 'SEO')
    Rect(28, 601, 16, 1); T(28, 619, 'side', 'PHILADELPHIA-AREA'); T(28, 631, 'side', 'U.S. CITIZEN')
    Rect(28, 666, 16, 1)
    for b_, s_, h_ in ((684, 'HYUN.IO', 'https://hyun.io'), (696, 'HI@HYUN.IO', 'mailto:hi@hyun.io'), (708, 'LINKEDIN', 'https://www.linkedin.com/in/hyunseo')):
        T(28, b_, 'side link', s_, h_); Rect(28, b_ + 1.2, len(s_) * 4.347 + 0.1, 0.6, BLUE)
    T(28, 764, 'pageno', f'{n}/2')
def page(fn, n):
    PG[0] = n; RECTS.clear(); out.append('<section class="page">'); chrome(n); fn()
    out.append('<svg class="rules" viewBox="0 0 612 792">' + ''.join(RECTS) + '</svg></section>')

def p1():
    T(L, 37, 'tag', 'Product engineer and designer making complex systems usable across space, RF')
    T(L, 48, 'tag', 'intelligence, AI, quantum, cybersecurity, and geospatial data.')
    header(L, 84, 'PROFILE', 200); header(R, 84, 'CORE RANGE', 200)
    paras(L, 114, [
        ['I design and build products for hard technical', 'problems, then scale what works across the', 'organization.'],
        ['Currently Chief Product Officer at Kayhan Space,', 'where I work as a hands-on product engineer and', 'designer. Previously first product designer at', 'HawkEye 360 and senior designer/developer at IBM.'],
        ['I’m strongest when products involve uncertain data,', 'technical users, high-stakes decisions, and systems', 'that need to be made visible, usable, and credible.']])
    col(R, 114, [
        ('PRODUCT + COMPANY BUILDING', ['Product strategy, product-led growth, customer', 'discovery, go-to-market support, brand, executive', 'strategy, and internal operating systems.']),
        ('DESIGN + TECHNICAL EXECUTION', ['UX, interaction design, data visualization, frontend', 'development, design systems, prototyping, and', 'technical architecture.']),
        ('COMPLEX TECHNICAL DOMAINS', ['Space traffic coordination, satellite operations, RF', 'geolocation, geospatial intelligence, AI, quantum', 'computing, cybersecurity, robotics, HCI, cryptography,', 'and emerging interfaces.'])])
    header(L, 305, 'SELECTED IMPACT', 432)
    col(L, 335, [
        ('KAYHAN SPACE', ['Grew from Head of Design into Chief Product Officer', 'by building things other people use, giving the', 'company a shared design taste, a design floor, and', 'user-centric methods.']),
        ('MISSION SPACE', ['Joined HawkEye 360 as the company’s first product', 'designer and helped turn satellite-collected RF', 'geolocation data into an analyst-facing geospatial', 'intelligence platform.'])])
    col(R, 335, [
        ('SATCAT', ['Drove Satcat from product thesis to public platform', 'with thousands of registered users, hundreds of', 'thousands of visitors, and millions of page views over', 'the last 24 months.']),
        ('IBM RESEARCH', ['Designed emerging technology experiences across', 'Project Debater, IBM Quantum, Qiskit, robotics,', 'haptics, cybersecurity, and early AI interfaces. Patent', 'and research work cited 220+ times.'])])
    header(L, 484, 'EXPERIENCE', 432)
    company(523, 'KAYHAN SPACE :: CHIEF PRODUCT OFFICER', '2021–CURRENT :: REMOTE / BROOMFIELD, CO :: DESIGN → PRODUCT → CPO')
    left = [
        ('Scope of the role', ['Head of Design to CPO, hands-on the whole way: set', 'product direction with leadership, then did the', 'design and a lot of the building myself.']),
        ('Orbital operations', ['Designed and helped build product surfaces across', 'conjunction assessment, orbit determination, collision', 'avoidance, launch coordination, LEOP workflows, and', 'space traffic coordination.']),
        ('Brand + product surface', ['Led redesign of Kayhan’s brand, logo, website,', 'product experience, sales collateral, event presence,', 'and customer-facing materials.'])]
    right = [
        ('Public product growth', ['Drove Satcat into a public platform with thousands of', 'registered users, hundreds of thousands of visitors,', 'and millions of page views over the last 24 months.']),
        ('Satcat Terminal', ['Designed and developed Satcat Terminal, extending', 'orbital intelligence to financial, insurance, media,', 'analyst, and enterprise audiences without requiring', 'astrodynamics expertise.'])]
    left.append(NEW['ux']); right.append(NEW['ai']); right.append(NEW['meet'])
    col(L, 554, left); col(R, 554, right)

def p2():
    header(L, 28, 'EXPERIENCE CONTINUED', 432)
    company(67, 'HAWKEYE 360 :: PRINCIPAL DESIGNER', '2020–2021 :: HERNDON, VA :: FIRST PRODUCT DESIGNER')
    col(L, 98, [
        ('Category creation', ['Joined as the company’s first product designer and', 'helped turn satellite-collected RF geolocation data into', 'Mission Space, an analyst-facing intelligence platform.']),
        ('Uncertain RF data', ['Translated RF emissions, timing, probability, spoofing', 'indicators, error ellipses, and geospatial context into', 'workflows analysts could use to reason and tell stories.']),
        ('Performance', ['Improved map interaction from roughly 10–15 FPS to', '60 FPS by changing how visual layers recalculated', 'during pan and zoom interactions.'])])
    col(R, 98, [
        ('RF intelligence UX', ['Designed the core map, timeline, iconography, shell UI,', 'signal workflows, analyst interactions, and frontend', 'design system.']),
        ('Technical ownership', ['Built the initial frontend design kit in HTML, CSS, and', 'JavaScript; later worked across React, Redux,', 'TypeScript, GraphQL, SCSS, Deck.gl, and Luma.gl.']),
        ('Design function', ['Established the company’s design practice, led early', 'workshops, and managed, hired, and mentored two', 'designers.'])])
    company(283, 'IBM :: SENIOR DESIGNER + DEVELOPER', '2013–2019 :: AUSTIN, TX / YORKTOWN HEIGHTS, NY :: IBM DESIGN / SECURITY / RESEARCH')
    col(L, 314, [
        ('Research-to-product', ['Designed interfaces, prototypes, demos, and technical', 'explainers across IBM Security, IBM Design, and', 'IBM Research.']),
        ('Technical explainers', ['Created system-explainer videos with research teams,', 'translating complex AI, NLP, argument mining, and', 'debate-generation systems into clear stories and', 'visuals.']),
        ('Emerging interfaces', ['Contributed to robotics, haptics, physical computing,', 'Watson IoT, and cybersecurity product experiences.'])])
    col(R, 314, [
        ('Early AI', ['Designed Project Debater interfaces for live debate and', 'premier IBM events before generative AI became', 'mainstream.']),
        ('Quantum computing', ['Worked on early IBM Quantum and Qiskit interface', 'concepts, explainers, and on-site visualizations for', 'quantum circuits, queues, and computation.']),
        ('Intellectual property', ['Served on an Invention Disclosure Board and', 'contributed to a patent and research portfolio across', 'HCI, cybersecurity, cryptography, robotics, quantum,', 'and emerging interfaces.'])])
    header(L, 505, 'PATENTS, RESEARCH + RECOGNITION', 200); header(R, 505, 'TECHNICAL + DOMAIN DEPTH', 200)
    fc = NEW['fc']
    paras(L, 535, [
        ['Patent and research portfolio cited 220+ times across', 'HCI, cybersecurity, cryptography, robotics, quantum,', 'RF geolocation, and emerging interfaces.'],
        fc,
        ['Co-led a voter-nominated SXSW Interactive workshop', 'on privacy and counter-surveillance with 60+', 'participants.'],
        ['Wrote, designed, and published “тaк...”, a photobook', 'exhibited in the official Chernobyl Library and', 'Chernobyl Museum in Ukraine. Reached #1 in', 'Amazon’s Photo Essays category at launch.']])
    ai = NEW['aisys']
    col(R, 535, [
        ('PRODUCT / DESIGN', ['Product strategy, UX, interaction design, design', 'systems, data visualization, prototyping, branding,', 'GTM support, customer discovery.']),
        ('ENGINEERING', ['TypeScript, JavaScript, React, Next.js, Node.js,', 'GraphQL, SCSS, HTML/CSS, CesiumJS, Deck.gl,', 'Luma.gl, MongoDB, Supabase, Vercel, Git, Unix/Linux.']),
        ('AI / SYSTEMS', ai),
        ('DOMAINS', ['Space traffic coordination, satellite operations, orbital', 'intelligence, RF geolocation, geospatial intelligence,', 'cybersecurity, AI, quantum computing, robotics, HCI,', 'cryptography.'])])
    header(L, 717, 'EDUCATION', 200)
    T(L, 747, 'sub', 'RUTGERS UNIVERSITY :: BA, GRAPHIC DESIGN'); T(L, 760, 'sub', '2013 :: CAMDEN, NJ')

NEW = dict(
    ux=('UX-first engineering', ['Taught developers to be user-centric and UX-first,', 'installing a shared design taste and a design floor', 'across the company.']),
    ai=('AI-native workflows', ['Built the corporate MCP, co-maintained with the Chief', 'of AI, and ran town halls that took the company from', 'almost no AI tooling use to company-wide adoption.']),
    meet=('Meeting users where they are', ['Designed and built Satcat for ChatGPT, bringing the', 'product to where users already are instead of', 'funneling them to our site.']),
    fc=['Work recognized by Fast Company’s Innovation by', 'Design Awards in 2023 and 2025.'],
    aisys=['AI-native workflows, MCP, agent skills, ChatGPT apps,', 'internal knowledge systems, technical architecture,', 'complex data products, analytics workflows.'],
)
page(p1, 1); page(p2, 2)
css = f'''
@font-face{{font-family:PlexMono;font-weight:300;src:url(fonts/IBMPlexMono-Light.woff2)}}
@font-face{{font-family:PlexMono;font-weight:400;src:url(fonts/IBMPlexMono-Regular.woff2)}}
@font-face{{font-family:PlexMono;font-weight:500;src:url(fonts/IBMPlexMono-Medium.woff2)}}
@font-face{{font-family:PlexMono;font-weight:600;src:url(fonts/IBMPlexMono-SemiBold.woff2)}}
@page{{size:612pt 792pt;margin:0}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{position:relative;width:612pt;height:792pt;overflow:hidden;break-after:page}}
.t{{position:absolute;left:0;top:0;white-space:pre;line-height:0;height:0;color:#000;font-kerning:normal}}
.rules{{position:absolute;left:0;top:0;width:612pt;height:792pt}}
.head,.tag,.side,.name,.pageno{{color:{BLUE}}}
.side a{{color:inherit;text-decoration:none}}
.head{{font:{STY['head'][1]} {STY['head'][2]}pt/0 {STY['head'][0]};letter-spacing:{STY['head'][3]}em}}
.tag{{font:{STY['tag'][1]} {STY['tag'][2]}pt/0 {STY['tag'][0]};letter-spacing:{STY['tag'][3]}em}}
.sub{{font:{STY['sub'][1]} {STY['sub'][2]}pt/0 {STY['sub'][0]};letter-spacing:{STY['sub'][3]}em}}
.side{{font:{STY['side'][1]} {STY['side'][2]}pt/0 {STY['side'][0]};letter-spacing:{STY['side'][3]}em}}
.body{{font:{STY['body'][1]} {STY['body'][2]}pt/0 {STY['body'][0]};letter-spacing:{STY['body'][3]}em}}
.body0{{font:{STY['body0'][1]} {STY['body0'][2]}pt/0 {STY['body0'][0]};letter-spacing:{STY['body0'][3]}em}}
.name{{font:{STY['name'][1]} {STY['name'][2]}pt/0 {STY['name'][0]};letter-spacing:{STY['name'][3]}em}}
.pageno{{font:{STY['pageno'][1]} {STY['pageno'][2]}pt/0 {STY['pageno'][0]};letter-spacing:{STY['pageno'][3]}em}}
'''
print(f'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hyun Seo Resume</title><style>{css}</style></head><body>{"".join(out)}</body></html>')
