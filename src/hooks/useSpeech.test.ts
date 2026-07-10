import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSpeech from './useSpeech';

describe('useSpeech hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call speak correctly using speechSynthesis', () => {
    const speakMock = vi.fn();
    const cancelMock = vi.fn();

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: speakMock,
        cancel: cancelMock,
      },
      writable: true,
    });

    const { result } = renderHook(() => useSpeech());
    
    act(() => {
      result.current.speak('Hello World');
    });

    expect(cancelMock).toHaveBeenCalled();
    expect(speakMock).toHaveBeenCalled();
  });
});
