import { SeededRandom } from "./SeededRandom";

describe("SeededRandom", () => {
  it("should generate a random number", () => {
    let seededRandom = new SeededRandom("0xa87a1633eb7fa825c834ce6faf60dfb8f13d519a0947d5e659a49ec7cb8a4431", "salt");
    let randomNumber = seededRandom.getRandomInt(1, 5);
    console.log(randomNumber);
    expect(randomNumber).toBeGreaterThan(0);
    expect(randomNumber).toBeLessThan(6);

    seededRandom = new SeededRandom("0xa5510d06a5b190a5a50bc9058c0e96222917b54d6258ac5cc83e454f025bf439", "salt");
    randomNumber = seededRandom.getRandomInt(1, 50);
    console.log(randomNumber);
    expect(randomNumber).toBeGreaterThan(0);
    expect(randomNumber).toBeLessThan(6);

  });
});
