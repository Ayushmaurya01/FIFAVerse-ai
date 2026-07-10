import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeNumber } from './sanitize';

describe('Sanitize Utilities', () => {
  describe('sanitizeInput', () => {
    it('should return empty string for non-string inputs', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
      expect(sanitizeInput(123 as any)).toBe('');
    });

    it('should strip HTML tags correctly', () => {
      expect(sanitizeInput('<div>hello</div>')).toBe('hello');
      expect(sanitizeInput('<script>alert("hack")</script>')).toBe('alert(&quot;hack&quot;)');
    });

    it('should escape special HTML entities', () => {
      expect(sanitizeInput('cats & dogs')).toBe('cats &amp; dogs');
      expect(sanitizeInput('2 < 5')).toBe('2 &lt; 5');
      expect(sanitizeInput('5 > 2')).toBe('5 &gt; 2');
      expect(sanitizeInput('He said "hello"')).toBe('He said &quot;hello&quot;');
      expect(sanitizeInput("It's a trap")).toBe('It&#x27;s a trap');
    });
  });

  describe('sanitizeNumber', () => {
    it('should parse valid numbers', () => {
      expect(sanitizeNumber('123')).toBe(123);
      expect(sanitizeNumber(45.6)).toBe(45.6);
    });

    it('should return default value for invalid numbers', () => {
      expect(sanitizeNumber('abc', 10)).toBe(10);
      expect(sanitizeNumber(undefined, 5)).toBe(5);
    });
  });
});
