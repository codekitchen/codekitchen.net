// @flow

export const assert = <T>(x: ?T): T => {
  if (!x) throw new Error()
  return x
}