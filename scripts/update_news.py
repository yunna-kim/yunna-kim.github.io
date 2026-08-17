#!/usr/bin/env python3
"""Mirror title/date/link only from Kyung Hee Korean Medicine Hospital doctor news page."""
import http.cookiejar, json, pathlib, re, urllib.request
from bs4 import BeautifulSoup
URL="https://km.khmc.or.kr/kr/treatment/doctor/14950/news.do"
OUT=pathlib.Path("assets/data/news.json")
def fetch(url):
    # The hospital site issues a session cookie and redirects back to the same URL.
    # Without a cookie jar the redirect loops forever and urllib raises HTTP Error 302.
    opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    opener.addheaders=[("User-Agent","yunna-kim-website/1.0 (mailto:yunna.anna.kim@khu.ac.kr)"),
                       ("Accept","text/html,application/xhtml+xml")]
    with opener.open(url,timeout=30) as r:
        return r.read().decode("utf-8","ignore")
def main():
    html=fetch(URL)
    soup=BeautifulSoup(html,"html.parser")
    items=[]
    for a in soup.select('#tab-news .infonews_box_list ul li a'):
        title_el=a.select_one('p.f_l')
        date_el=a.select_one('p.f_r')
        if not title_el or not date_el: continue
        raw=title_el.get_text(' ',strip=True)
        date=date_el.get_text(' ',strip=True)
        href=(a.get('href') or '').strip()
        if href == 'nomal' or not re.match(r'^\d{4}-\d{2}-\d{2}$', date): continue
        if href.startswith('//'): href='https:'+href
        elif href.startswith('/'): href='https://km.khmc.or.kr'+href
        title=re.sub(r'^[^-–]+[-–]\s*','',raw).strip() or raw
        items.append({'date':date,'title':title,'raw_title':raw,'url':href,'source':'경희대학교한방병원 의료진소식'})
    if not items: raise RuntimeError('No news items parsed')
    OUT.write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__ == '__main__': main()
