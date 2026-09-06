#!/usr/bin/env python3
"""홈페이지 데이터가 CV마스터(cv-master.yaml)와 어긋났는지 대조한다.

CV마스터가 실적의 원본이고 홈페이지는 결과물이다. 다만 마스터에는 영문 필드가
없어서 홈페이지를 통째로 렌더할 수는 없다(영문 페이지가 날아간다). 그래서
'덮어쓰기'가 아니라 '어긋난 곳 알려주기'로 만들었다.

    python scripts/check_against_master.py [마스터경로]

어긋난 곳이 있으면 종료코드 1, 없으면 0.
"""
import json, pathlib, re, sys, unicodedata

DEFAULT_MASTER = r"C:\Users\annai\내 드라이브\Fellow\이력서\CV마스터\cv-master.yaml"
DATA = pathlib.Path("assets/data")


def norm(s):
    s = unicodedata.normalize("NFKC", str(s or "")).lower()
    return re.sub(r"[^a-z0-9가-힣]+", "", s)


def digits(s):
    return re.sub(r"[^0-9]", "", str(s or ""))[:8]


def load(name):
    p = DATA / f"{name}.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def keys_of(x):
    """DOI 와 제목 앞부분 — 둘 중 하나만 맞아도 같은 항목으로 본다.
    마스터의 옛 논문에는 DOI 가 없어서 제목 대조가 필요하다."""
    ks = {norm(x.get("title"))[:40], norm(x.get("title_en"))[:40]}
    if x.get("doi"):
        ks.add(str(x["doi"]).lower())
    return {k for k in ks if k}


def main():
    try:
        import yaml
    except ImportError:
        print("pyyaml 이 필요하다:  pip install pyyaml")
        return 2
    master = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_MASTER)
    if not master.exists():
        print(f"마스터를 찾을 수 없다: {master}")
        return 2
    m = yaml.safe_load(master.read_text(encoding="utf-8"))

    talks = load("talks_ko")
    cat = lambda *c: [t for t in talks if t.get("category") in c]
    pubs = load("publications") + load("domestic_publications")
    m_pubs = [x for v in m["publications"].values() for x in v]

    rows = [
        ("논문",          len(m_pubs),                         len(pubs)),
        ("학회 발표",     len(m.get("conferences", [])),       len(cat("Oral", "Poster", "Demonstration"))),
        ("학술 초청강연", len(m.get("lectures_academic", [])), len(cat("Academic lecture"))),
        ("대중 강의",     len(m.get("lectures_public", [])),   len(cat("Public lecture"))),
        ("대학 강의",     len(m.get("teaching", [])),          len(cat("Teaching"))),
        ("연구과제",      len(m.get("projects", [])),          len(load("projects_ko"))),
        ("수상",          len(m.get("awards", [])),            len(load("awards_ko"))),
        ("언론",          len(m.get("media", [])),             len(load("media_ko"))),
    ]
    bad = []
    print(f"{'항목':<14}{'마스터':>8}{'홈페이지':>10}")
    print("-" * 34)
    for name, a, b in rows:
        if a != b:
            bad.append(name)
        print(f"{name:<14}{a:>8}{b:>10}" + ("   <- 다름" if a != b else ""))

    mk = set().union(*(keys_of(x) for x in m_pubs)) if m_pubs else set()
    hk = set().union(*(keys_of(x) for x in pubs)) if pubs else set()
    only_m = [x for x in m_pubs if not (keys_of(x) & hk)]
    only_h = [x for x in pubs if not (keys_of(x) & mk)]
    if only_m or only_h:
        bad.append("논문 목록")
        print("\n[논문 목록 차이]")
        for x in only_m:
            print(f"   마스터에만  : {x.get('year')} {str(x.get('title'))[:62]}")
        for x in only_h:
            print(f"   홈페이지에만: {x.get('year')} {str(x.get('title'))[:62]}")

    md, hd = {}, {}
    for x in m.get("conferences", []):
        md[digits(x.get("date"))] = md.get(digits(x.get("date")), 0) + 1
    for x in cat("Oral", "Poster", "Demonstration"):
        hd[digits(x.get("date"))] = hd.get(digits(x.get("date")), 0) + 1
    diff = sorted(d for d in set(md) | set(hd) if md.get(d, 0) != hd.get(d, 0))
    if diff:
        bad.append("학회 발표 날짜")
        print("\n[학회 발표 날짜별 건수 차이]")
        for d in diff:
            print(f"   {d}: 마스터 {md.get(d, 0)}건 / 홈페이지 {hd.get(d, 0)}건")

    print()
    if bad:
        print("어긋난 항목: " + ", ".join(dict.fromkeys(bad)))
        print("CV마스터가 원본이다. 홈페이지를 마스터에 맞춰 고칠 것.")
        return 1
    print("모두 일치한다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
