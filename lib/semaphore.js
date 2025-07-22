export class Semaphore {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent;
    this.currentCount = 0;
    this.queue = [];
  }
  enter() {
    return new Promise((resolve) => {
      if (this.currentCount < this.maxConcurrent) {
        resolve();
        this.currentCount++;
      } else {
        this.queue.push(resolve);
      }
    });
  }
  leave() {
    this.currentCount--;
    if (this.queue.length > 0) {
      const nextResolve = this.queue.shift();
      nextResolve();
    }
  }
}
