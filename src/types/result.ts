export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({
  success: true,
  value,
})

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
})
