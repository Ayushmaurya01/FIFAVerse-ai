import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock canvas getContext 2D for GlobeCanvas and Recharts testing
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn(),
    })),
    setLineDash: vi.fn(),
  };
});

// Mock SpeechSynthesis API
const mockSpeechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  speaking: false,
  paused: false,
  pending: false,
  onvoiceschanged: null,
};
Object.defineProperty(window, 'speechSynthesis', {
  value: mockSpeechSynthesis,
  writable: true,
});

class MockSpeechSynthesisUtterance {
  text = '';
  lang = '';
  volume = 1;
  rate = 1;
  pitch = 1;
  voice = null;
  onstart = null;
  onend = null;
  onerror = null;
  constructor(text?: string) {
    this.text = text || '';
  }
}
Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true,
});

// Mock SpeechRecognition API
class MockSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = '';
  onstart = null;
  onresult = null;
  onerror = null;
  onend = null;
  start = vi.fn().mockImplementation(function(this: any) {
    if (this.onstart) this.onstart();
  });
  stop = vi.fn().mockImplementation(function(this: any) {
    if (this.onend) this.onend();
  });
}
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true,
});
Object.defineProperty(window, 'SpeechRecognition', {
  value: MockSpeechRecognition,
  writable: true,
});

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  value: MockIntersectionObserver,
  writable: true,
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true,
});
