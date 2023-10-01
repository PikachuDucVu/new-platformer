export class Timer {
  value: number;
  onComplete?: () => void;

  constructor(value = 0, _onComplete?: () => void) {
    this.value = value;
    this.onComplete = _onComplete;
  }

  update(delta: number) {
    if (this.value > 0) {
      this.value -= delta;
      if (this.value <= 0) {
        this.value = 0;
        this.onComplete && this.onComplete();
      }
    }
  }

  clear() {
    this.value = 0;
  }
}
