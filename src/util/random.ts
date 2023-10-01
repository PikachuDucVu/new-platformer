// @ts-ignore
import alea from "./alea.js";

export class Random {
  alea: any;
  constructor(public seed: string) {
    this.alea = alea(seed);
  }

  public nextFloat(): number;
  public nextFloat(max: number): number;
  public nextFloat(min: number, max: number): number;
  public nextFloat(n1?: number, n2?: number): number {
    return this.alea.nextFloat(n1, n2);
  }

  public nextInt(): number;
  public nextInt(max: number): number;
  public nextInt(min: number, max: number): number;
  public nextInt(n1?: number, n2?: number): number {
    return this.alea.nextInt(n1, n2);
  }
}
