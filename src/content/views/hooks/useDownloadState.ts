import { createSignal, Accessor } from "solid-js";
import type { DownloadState } from "../types";

export function useDownloadState(): [Accessor<DownloadState>, {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}] {
  const [state, setState] = createSignal<DownloadState>({
    isLoading: false,
    error: null
  });

  return [
    state,
    {
      setLoading: (loading: boolean) => setState(prev => ({ ...prev, isLoading: loading })),
      setError: (error: string | null) => setState(prev => ({ ...prev, error }))
    }
  ];
}