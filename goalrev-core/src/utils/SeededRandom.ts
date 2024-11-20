export class SeededRandom {
  private seed: number;
  private salt: number;

  constructor(seedHex: string, saltStr: string) {
      // Convert seed from hex string to number and ensure it's a positive 32-bit unsigned integer
      this.seed = parseInt(seedHex, 16) >>> 0;
      // Hash the salt string to get a positive 32-bit unsigned integer
      this.salt = this.hashString(saltStr);
  }

  // String hash function that produces a positive 32-bit unsigned integer
  private hashString(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = (((hash << 5) - hash + str.charCodeAt(i)) >>> 0);
      }
      return hash;
  }

  // LCG parameters
  private m = 0x80000000; // 2^31
  private a = 1103515245;
  private c = 12345;

  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  public random(): number {
      this.seed = (this.a * this.seed + this.c + this.salt) >>> 0;
      this.seed = this.seed % this.m;
      return this.seed / this.m;
  }

  // Generate a random integer between min (inclusive) and max (inclusive)
  public getRandomInt(min: number, max: number): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      if (min > max) {
          return min; // If min and max are the same
      }
      const rand = this.random();
      return Math.floor(rand * (max - min + 1)) + min;
  }
}