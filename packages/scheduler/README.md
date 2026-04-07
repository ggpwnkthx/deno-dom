# @ggpwnkthx/dom-scheduler

Microtask batching and rerender scheduling.

## Status

**Implemented** — microtask batching, deduplication, and rerender scheduling.

## Purpose

- Microtask-based update batching
- Rerender scheduling and prioritization
- Task queue management
- Frame-synchronized updates

## Usage

```typescript
import {
  schedule,
  type Scheduler,
  type SchedulerConfig,
} from "jsr:@ggpwnkthx/dom-scheduler@^0.0.2";

// Schedule a rerender for a component
schedule((containerId: string) => {
  console.log("Rerendering container:", containerId);
}, "my-component-id");

// Configure scheduler behavior
const config: SchedulerConfig = {
  timeout: 5000,
  maxUpdatesPerBatch: 50,
};
```

## Note

This package should remain isolated from direct DOM manipulation. It schedules updates that `@ggpwnkthx/dom-runtime` executes.
