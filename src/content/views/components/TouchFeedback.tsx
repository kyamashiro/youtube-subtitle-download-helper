import type { Component } from "solid-js";

export const TouchFeedback: Component = () => (
  <yt-touch-feedback-shape>
    <div
      aria-hidden="true"
      class="yt-spec-touch-feedback-shape yt-spec-touch-feedback-shape--touch-response"
    >
      <div class="yt-spec-touch-feedback-shape__stroke"></div>
      <div class="yt-spec-touch-feedback-shape__fill"></div>
    </div>
  </yt-touch-feedback-shape>
);
