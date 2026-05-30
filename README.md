# Yunna Kim Personal Website

GitHub Pages용 정적 홈페이지입니다.

## 업로드 방법

1. 이 폴더 안의 모든 파일을 `yunna-kim.github.io` 저장소 루트에 업로드합니다.
2. GitHub 저장소의 `Settings > Pages`에서 `Deploy from a branch`와 `main / root`를 선택합니다.
3. 홈페이지 주소는 `https://yunna-kim.github.io/`입니다.
4. 국문이 메인이고, 영문은 `/en/`에 있습니다.

## 자동 업데이트

- 논문: `.github/workflows/update-data.yml`이 매주 1회 ORCID에서 `assets/data/publications.json`을 업데이트합니다.
- 언론보도: 병원 의료진소식 페이지에서 제목, 날짜, 링크만 가져와 `assets/data/news.json`을 업데이트합니다.
- GitHub Actions 탭에서 `Update publications and news`를 수동 실행할 수도 있습니다.

## 수정할 곳

- 디자인: `assets/css/styles.css`
- 공통 스크립트: `assets/js/main.js`
- 논문 데이터: `assets/data/publications.json`
- 언론보도 데이터: `assets/data/news.json`
- 연구과제: `assets/data/projects_ko.json`, `assets/data/projects_en.json`
- 방송 목록: `assets/data/media_ko.json`, `assets/data/media_en.json`
- 수상 목록: `assets/data/awards_ko.json`, `assets/data/awards_en.json`

## 주의

언론보도는 기사 전문을 복사하지 않고 제목, 날짜, 원문 링크만 표시합니다.
