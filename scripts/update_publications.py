#!/usr/bin/env python3
"""Merge new ORCID works into assets/data/publications.json.

Existing entries are never removed or rewritten: ORCID lists only part of the
record, so a full overwrite would silently drop papers. Only works that are not
already present get appended, with citation details filled in from Crossref so
they match the APA style of the hand-curated entries.
"""
import json, pathlib, re, time, unicodedata, urllib.parse, urllib.request
ORCID="0000-0003-2286-1242"
OUT=pathlib.Path("assets/data/publications.json")
UA="yunna-kim-website/1.0 (mailto:yunna.anna.kim@khu.ac.kr)"

def get(url):
    req=urllib.request.Request(url,headers={"Accept":"application/json","User-Agent":UA})
    with urllib.request.urlopen(req,timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

def norm_doi(doi):
    return re.sub(r'^(https?://)?(dx\.)?doi\.org/','',(doi or '').strip(),flags=re.I).lower().rstrip('/')

def norm_title(title):
    t=unicodedata.normalize("NFKC",(title or '')).lower()
    return re.sub(r'[^a-z0-9]+','',t)

def initials(given):
    """'Seok-Hee' -> 'S.-H.'   'Yunna' -> 'Y.'"""
    out=[]
    for part in (given or '').split():
        out.append('-'.join(s[0].upper()+'.' for s in part.split('-') if s))
    return ' '.join(out)

def authors_apa(authors):
    names=[]
    for a in authors:
        family=(a.get("family") or "").strip()
        if not family:
            if a.get("name"): names.append(a["name"].strip())
            continue
        ini=initials(a.get("given"))
        names.append(f"{family}, {ini}" if ini else family)
    if not names: return ""
    if len(names)==1: return names[0]
    return ", ".join(names[:-1])+", & "+names[-1]

def crossref_entry(doi, fallback_title, fallback_year, fallback_journal):
    """Build a fully-formed entry from Crossref; fall back to ORCID summary data."""
    title, year, journal, authors, vol, issue, pages = fallback_title, fallback_year, fallback_journal, "", "", "", ""
    try:
        msg=get(f"https://api.crossref.org/works/{urllib.parse.quote(doi)}").get("message",{})
        title=(msg.get("title") or [title])[0] or title
        journal=(msg.get("container-title") or [journal])[0] or journal
        parts=((msg.get("issued") or {}).get("date-parts") or [[]])[0]
        if parts and parts[0]: year=str(parts[0])
        authors=authors_apa(msg.get("author") or [])
        vol=str(msg.get("volume") or "")
        issue=str(msg.get("issue") or "")
        pages=str(msg.get("page") or "").replace("-","–")
    except Exception as e:
        print(f"  ! Crossref lookup failed for {doi}: {e}")
    head=f"{authors} ({year}). " if authors and year else (f"{authors}. " if authors else (f"{year}. " if year else ""))
    cite=f"{head}{title}."
    if journal:
        tail=journal
        if vol:
            tail+=f", {vol}"
            if issue: tail+=f"({issue})"
        if pages: tail+=f", {pages}"
        cite+=f" {tail}."
    if doi: cite+=f" https://doi.org/{doi}"
    return {"year":year,"title":title,"citation":cite,"doi":doi,"url":f"https://doi.org/{doi}" if doi else ""}

def main():
    existing=json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else []
    seen_doi={norm_doi(p.get("doi")) for p in existing if p.get("doi")}
    seen_title={norm_title(p.get("title")) for p in existing if p.get("title")}

    data=get(f"https://pub.orcid.org/v3.0/{ORCID}/works")
    added=[]
    for group in data.get("group",[]):
        w=(group.get("work-summary") or [{}])[0]
        title=(((w.get("title") or {}).get("title") or {}).get("value")) or "Untitled"
        year=(((w.get("publication-date") or {}).get("year") or {}).get("value")) or ""
        journal=(w.get("journal-title") or {}).get("value") or ""
        doi=""
        for e in ((w.get("external-ids") or {}).get("external-id") or []):
            if e.get("external-id-type")=="doi":
                doi=norm_doi(e.get("external-id-value")); break
        # Title is checked even when a DOI is present: the same paper is often
        # recorded with a different (or missing) DOI on each side, which would
        # otherwise slip past the DOI check and be appended as a duplicate.
        if (doi and doi in seen_doi) or norm_title(title) in seen_title:
            continue
        print(f"  + {year} {title[:70]}")
        entry=crossref_entry(doi,title,year,journal) if doi else \
              {"year":year,"title":title,"citation":f"{year}. {title}"+(f". {journal}." if journal else "."),"doi":"","url":""}
        added.append(entry)
        if doi: seen_doi.add(doi)
        seen_title.add(norm_title(entry["title"])); seen_title.add(norm_title(title))
        time.sleep(0.5)  # be polite to Crossref

    if not added:
        print("No new publications from ORCID.")
        return
    merged=existing+added
    merged.sort(key=lambda x:x.get("year",""),reverse=True)  # stable: keeps order within a year
    OUT.write_text(json.dumps(merged,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"Added {len(added)} publication(s); total {len(merged)}.")

if __name__=="__main__": main()
