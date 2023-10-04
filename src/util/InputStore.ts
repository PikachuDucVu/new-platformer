import { Input } from "../types";

export class InputStore {
  private map = new Map<number, Input[]>();
  public add(frame: number, input: Input) {
    let inputs = this.map.get(frame);
    if (!inputs) {
      inputs = [];
      this.map.set(frame, inputs);
    }
    inputs.push(input);
  }
  public get(frame: number): Input[] | undefined {
    return this.map.get(frame);
  }
}
