/**
 * Tests for URL normalization and validation (TikTok, Instagram, YouTube Shorts).
 * Run: node --test server/utils/url.test.js
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { normalizeVideoUrl, isValidVideoUrl } from './url.js';

describe('normalizeVideoUrl', () => {
  it('returns empty string for non-string input', () => {
    assert.strictEqual(normalizeVideoUrl(null), '');
    assert.strictEqual(normalizeVideoUrl(undefined), '');
    assert.strictEqual(normalizeVideoUrl(123), '');
  });

  it('trims leading and trailing whitespace', () => {
    assert.strictEqual(normalizeVideoUrl('  https://tiktok.com/@u/video/1  '), 'https://tiktok.com/@u/video/1');
  });

  it('collapses newlines and multiple spaces (paste-safe)', () => {
    assert.strictEqual(
      normalizeVideoUrl('https://tiktok.com/@u/video/1\n'),
      'https://tiktok.com/@u/video/1'
    );
    assert.strictEqual(
      normalizeVideoUrl('https://instagram.com/reel/ABC/\r\n'),
      'https://instagram.com/reel/ABC/'
    );
    assert.strictEqual(
      normalizeVideoUrl('https://tiktok.com/x  \n  /video/1'),
      'https://tiktok.com/x /video/1'
    );
  });

  it('leaves valid URL unchanged when already clean', () => {
    const url = 'https://www.tiktok.com/@user/video/7067695578729221378';
    assert.strictEqual(normalizeVideoUrl(url), url);
  });
});

describe('isValidVideoUrl', () => {
  it('rejects empty or non-string', () => {
    assert.strictEqual(isValidVideoUrl(''), false);
    assert.strictEqual(isValidVideoUrl(null), false);
    assert.strictEqual(isValidVideoUrl(undefined), false);
    assert.strictEqual(isValidVideoUrl('   '), false);
  });

  const validTikTok = [
    'https://www.tiktok.com/@user/video/7067695578729221378',
    'https://tiktok.com/@user/video/123',
    'https://vm.tiktok.com/Abc12Xy/',
    'https://vt.tiktok.com/xyzAbc',
    'http://www.tiktok.com/@u/video/1',
  ];

  for (const url of validTikTok) {
    it(`accepts TikTok URL: ${url.slice(0, 50)}...`, () => {
      assert.strictEqual(isValidVideoUrl(url), true);
      assert.strictEqual(isValidVideoUrl(normalizeVideoUrl(`  ${url}  `)), true);
    });
  }

  const validInstagram = [
    'https://www.instagram.com/reel/ABC123/',
    'https://www.instagram.com/reel/AbC_1-2/',
    'https://instagram.com/p/ABC123/',
    'https://www.instagram.com/p/shortcode_here',
    'http://instagram.com/reel/xYz/',
  ];

  for (const url of validInstagram) {
    it(`accepts Instagram URL: ${url.slice(0, 50)}...`, () => {
      assert.strictEqual(isValidVideoUrl(url), true);
      assert.strictEqual(isValidVideoUrl(normalizeVideoUrl(`\n${url}\n`)), true);
    });
  }

  const validYouTube = [
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://youtube.com/shorts/VIDEO_ID',
    'https://www.youtube.com/watch?v=abc123',
    'https://youtube.com/watch?v=abc',
    'https://youtu.be/dQw4w9WgXcQ',
    'http://youtu.be/xyz',
  ];

  for (const url of validYouTube) {
    it(`accepts YouTube URL: ${url.slice(0, 50)}...`, () => {
      assert.strictEqual(isValidVideoUrl(url), true);
    });
  }

  const invalid = [
    'https://twitter.com/user/status/123',
    'https://www.tiktok.com',
    'https://www.tiktok.com/',
    'https://instagram.com/',
    'https://youtube.com/',
    'https://youtube.com/channel/UCxxx',
    'https://youtube.com/playlist?list=xxx',
    'https://m.tiktok.com/v/123',
    'https://tiktok.com',
    'not a url',
    'ftp://tiktok.com/@u/video/1',
  ];

  for (const url of invalid) {
    it(`rejects invalid URL: ${url.slice(0, 45)}...`, () => {
      assert.strictEqual(isValidVideoUrl(url), false);
    });
  }
});
