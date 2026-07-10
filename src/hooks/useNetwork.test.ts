import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useNetwork from './useNetwork';

describe('useNetwork hook', () => {
  it('should track online status changes', () => {
    // Mock navigator.onLine initially to true
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    const { result } = renderHook(() => useNetwork());
    expect(result.current).toBe(true);

    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    // Simulate going online
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);

    // Reset property
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine });
  });
});
