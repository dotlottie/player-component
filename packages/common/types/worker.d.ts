/**
 * Copyright 2023 Design Barn Inc.
 */

declare module 'web-worker:*' {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
