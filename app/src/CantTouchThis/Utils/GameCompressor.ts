import LZUTF8 from "lzutf8";

class GameCompresser {
  static compress(data): any {
    return LZUTF8.compress(data, {
      outputEncoding: "Base64",
    });
  }

  static decompress(compressedData): any {
    return LZUTF8.decompress(compressedData, {
      inputEncoding: "Base64",
    });
  }
}

export default GameCompresser;
