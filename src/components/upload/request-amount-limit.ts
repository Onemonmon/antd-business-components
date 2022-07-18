type RequestType = () => Promise<any>;

class Schedule {
  maxCount: number;
  taskQueue: RequestType[];
  currentCount: number;
  constructor(maxCount: number, tasks: RequestType[] = []) {
    this.maxCount = maxCount;
    this.taskQueue = tasks;
    this.currentCount = 0;
  }
  async addRequest(requests: RequestType[]) {
    this.taskQueue.push(...requests);
    await this.exec();
  }

  exec() {
    return new Promise((resolve) => {
      if (!this.taskQueue.length) resolve([]);
      while (this.taskQueue.length && this.currentCount < this.maxCount) {
        const task = this.taskQueue.shift();
        if (task) {
          this.currentCount++;
          task().then((res) => {
            this.currentCount--;
            if (this.currentCount === 0 && !this.taskQueue.length) {
              resolve(res);
            } else {
              this.exec();
            }
          });
        }
      }
    });
  }
}
export default Schedule;
