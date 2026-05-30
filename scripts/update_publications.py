#!/usr/bin/env python3
"""Update assets/data/publications.json from ORCID public API. Falls back to existing data on error."""
import json, urllib.request, urllib.parse, pathlib, re
ORCID="0000-0003-2286-1242"
OUT=pathlib.Path("assets/data/publications.json")
def get(url, accept="application/json"):
    req=urllib.request.Request(url,headers={"Accept":accept,"User-Agent":"yunna-kim-website/1.0 (mailto:yunna.anna.kim@khu.ac.kr)"})
    with urllib.request.urlopen(req,timeout=30) as r:
        return r.read().decode("utf-8")
def main():
    data=json.loads(get(f"https://pub.orcid.org/v3.0/{ORCID}/works"))
    items=[]
    for group in data.get("group",[]):
        w=(group.get("work-summary") or [{}])[0]
        title=(((w.get("title") or {}).get("title") or {}).get("value")) or "Untitled"
        year=(((w.get("publication-date") or {}).get("year") or {}).get("value")) or ""
        journal=(w.get("journal-title") or {}).get("value") or ""
        doi=""
        for e in ((w.get("external-ids") or {}).get("external-id") or []):
            if e.get("external-id-type") == "doi":
                doi=e.get("external-id-value","").strip(); break
        citation=f"{year}. {title}" + (f". {journal}." if journal else ".")
        items.append({"year":year,"title":title,"citation":citation,"doi":doi,"url":f"https://doi.org/{doi}" if doi else ""})
    items.sort(key=lambda x:x.get("year",""), reverse=True)
    OUT.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding="utf-8")
if __name__ == "__main__": main()
