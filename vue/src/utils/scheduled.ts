//创建定时器，默认3秒刷新一次 调用: createScheduled('string', () => { Function(), delay })
export default function scheduled() {
  const timerObj = {};
  const createScheduled = (timerId: string, delay: number = 3000, callback: Function) => {
    clearInterval(timerObj[timerId]);
    timerObj[timerId] = setInterval(() => {
      callback && callback();
    }, delay);
  }

  onBeforeUnmount(() => {
    Object.keys(timerObj).forEach((key) => {
      clearInterval(timerObj[key]);
    });
  });

  return {
    createScheduled
  };
}