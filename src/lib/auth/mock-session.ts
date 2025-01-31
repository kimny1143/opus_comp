import { Session, SessionCreateParams } from './session-manager'

interface MockFunction<T> {
  (...args: any[]): T;
  mockResolvedValue: (value: T extends Promise<infer U> ? U : never) => void;
  mockImplementation: (fn: (...args: any[]) => T) => void;
}

interface MockedSessionManager {
  create: MockFunction<Promise<Session>>;
  get: MockFunction<Promise<Session | null>>;
  destroy: MockFunction<Promise<boolean>>;
}

function createMockFunction<T>(): MockFunction<T> {
  let implementation = (...args: any[]): T => ({} as T);
  const fn = (...args: any[]): T => implementation(...args);
  fn.mockResolvedValue = (value: T extends Promise<infer U> ? U : never) => {
    implementation = (async () => value) as unknown as (...args: any[]) => T;
  };
  fn.mockImplementation = (newImpl: (...args: any[]) => T) => {
    implementation = newImpl;
  };
  return fn as MockFunction<T>;
}

export const mockSession: MockedSessionManager = {
  create: createMockFunction<Promise<Session>>(),
  get: createMockFunction<Promise<Session | null>>(),
  destroy: createMockFunction<Promise<boolean>>()
};