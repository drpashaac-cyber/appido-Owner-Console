// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useResource } from "./core";

describe("useResource (async data hook)", () => {
  it("starts loading, then exposes resolved data", async () => {
    const { result } = renderHook(() => useResource(() => Promise.resolve(42), []));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe(42);
    expect(result.current.error).toBeNull();
  });
  it("captures a rejected fetch as a typed Error", async () => {
    const { result } = renderHook(() => useResource<number>(() => Promise.reject(new Error("boom")), []));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.data).toBeNull();
  });
  it("retry() re-runs the fetcher", async () => {
    let n = 0;
    const { result } = renderHook(() => useResource(() => Promise.resolve(++n), []));
    await waitFor(() => expect(result.current.data).toBe(1));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.data).toBe(2));
  });
});
