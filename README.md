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


## v2 업데이트
- `media.html` 언론보도는 10개씩 페이지네이션됩니다.
- `talks.html` / `en/talks.html`에 강의·학회발표 페이지와 Google My Maps embed를 추가했습니다.
- 첫 화면 논문 카운트는 기본값을 표시하고, `assets/data/publications.json` 로딩 성공 시 자동 보정됩니다.
- 전체/참여 연구과제는 `assets/data/projects_ko.json`, `assets/data/projects_en.json`에 계속 추가하면 됩니다.
- 학회발표/강의는 `assets/data/talks_ko.json`, `assets/data/talks_en.json`에 추가하면 됩니다.


## 프로필 사진 넣는 방법

프로필 사진을 홈페이지에 표시하려면 사진 파일을 아래 위치에 업로드하세요.

```
assets/img/profile.jpg
```

권장 비율은 세로형 4:5 또는 정사각형이며, 파일명은 반드시 `profile.jpg`로 맞추는 것이 가장 쉽습니다.
이미 `YunnaKim.png` 파일을 사용하고 싶다면 `assets/img/profile.jpg`로 이름을 바꾸어 넣거나, HTML의 이미지 경로를 `YunnaKim.png`로 수정하면 됩니다.
