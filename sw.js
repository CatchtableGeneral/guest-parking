/**
 * 손님 주차할인 PWA — 서비스 워커
 * 역할: HTML은 무조건 서버에서 새로 받기 (Network-First)
 *       AOS Chrome 캐시 문제 방지
 */

var CACHE_NAME = 'guest-parking-v1';

// ★ 설치 시: 즉시 활성화 (대기 없이)
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

// ★ 활성화 시: 이전 캐시 전부 삭제 + 즉시 제어 시작
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ★ 핵심: 네트워크 우선 (Network-First) 전략
//   → 서버에서 먼저 받아오고, 실패하면 캐시 사용 (오프라인 대비)
self.addEventListener('fetch', function(e) {
  var req = e.request;

  // HTML 페이지 요청만 Network-First로 처리
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-store' })
        .then(function(res) {
          // 성공하면 캐시에도 저장 (오프라인 대비)
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(req, clone); });
          return res;
        })
        .catch(function() {
          // 네트워크 실패 → 캐시에서 가져오기
          return caches.match(req);
        })
    );
    return;
  }

  // 나머지(CSS, JS, 이미지, 폰트 등)는 브라우저 기본 동작
  return;
});
