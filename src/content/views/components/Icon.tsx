import type { Component } from "solid-js";

export const Icon: Component = () => (
  <div aria-hidden="true" class="yt-spec-button-shape-next__icon">
    <span class="ytIconWrapperHost">
      <span class="yt-icon-shape yt-spec-icon-shape">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            aria-hidden="true"
          >
            <rect
              x="5"
              y="3"
              width="14"
              height="16"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <line
              x1="7"
              y1="7"
              x2="17"
              y2="7"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <line
              x1="7"
              y1="10"
              x2="15"
              y2="10"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <line
              x1="7"
              y1="13"
              x2="17"
              y2="13"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
        </div>
      </span>
    </span>
  </div>
);
