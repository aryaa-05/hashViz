export function fnv1_64(message) {
  const utf8 = new TextEncoder().encode(message);
  let hash = 14695981039346656037n;
  const FNV_prime = 1099511628211n;

  for (let i = 0; i < utf8.length; i++) {
    hash = BigInt.asUintN(64, hash * FNV_prime);
    hash = BigInt.asUintN(64, hash ^ BigInt(utf8[i]));
  }
  return hash.toString(16).padStart(16, "0");
}

export function fnv1a_64(message) {
  const utf8 = new TextEncoder().encode(message);
  let hash = 14695981039346656037n;
  const FNV_prime = 1099511628211n;

  for (let i = 0; i < utf8.length; i++) {
    hash = BigInt.asUintN(64, hash ^ BigInt(utf8[i]));
    hash = BigInt.asUintN(64, hash * FNV_prime);
  }
  return hash.toString(16).padStart(16, "0");
}

export function murmurHash3(message) {
  const utf8 = new TextEncoder().encode(message);
  let h = 0; // Seed
  const len = utf8.length;
  let i = 0;
  let k;

  for (; i + 3 < len; i += 4) {
    k =
      utf8[i] | (utf8[i + 1] << 8) | (utf8[i + 2] << 16) | (utf8[i + 3] << 24);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }

  k = 0;
  switch (len & 3) {
    case 3:
      k ^= utf8[i + 2] << 16;
    case 2:
      k ^= utf8[i + 1] << 8;
    case 1:
      k ^= utf8[i];
      k = Math.imul(k, 0xcc9e2d51);
      k = (k << 15) | (k >>> 17);
      k = Math.imul(k, 0x1b873593);
      h ^= k;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return (h >>> 0).toString(16).padStart(8, "0");
}

export function md5(message) {
  function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  const utf8 = new TextEncoder().encode(message);

  const mLen = utf8.length;
  const bitLen = mLen * 8;
  const l = mLen + 1 + 8;
  const kCount = (64 - (l % 64)) % 64;
  const paddedLen = l + kCount;

  const m = new Uint8Array(paddedLen);
  m.set(utf8);
  m[mLen] = 0x80;

  const dataView = new DataView(m.buffer);
  dataView.setUint32(paddedLen - 8, bitLen, true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
    9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
    16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10,
    15, 21,
  ];
  const K = Array.from(
    { length: 64 },
    (_, i) => Math.floor(4294967296 * Math.abs(Math.sin(i + 1))) | 0,
  );

  for (let i = 0; i < paddedLen; i += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = dataView.getUint32(i + j * 4, true);
    }

    let A = a0,
      B = b0,
      C = c0,
      D = d0;

    for (let j = 0; j < 64; j++) {
      let F, g;
      if (j < 16) {
        F = (B & C) | (~B & D);
        g = j;
      } else if (j < 32) {
        F = (D & B) | (~D & C);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        F = B ^ C ^ D;
        g = (3 * j + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * j) % 16;
      }

      const temp = D;
      D = C;
      C = B;
      B = (B + rol((A + F + K[j] + M[g]) | 0, s[j])) | 0;
      A = temp;
    }

    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const res = new ArrayBuffer(16);
  const resView = new DataView(res);
  resView.setUint32(0, a0, true);
  resView.setUint32(4, b0, true);
  resView.setUint32(8, c0, true);
  resView.setUint32(12, d0, true);

  let hex = "";
  for (let i = 0; i < 16; i++) {
    hex += new Uint8Array(res)[i].toString(16).padStart(2, "0");
  }
  return hex;
}

export function sha1(message) {
  function rol(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt));
  }
  const utf8 = new TextEncoder().encode(message);

  const mLen = utf8.length;
  const bitLen = mLen * 8;
  const l = mLen + 1 + 8;
  const kCount = (64 - (l % 64)) % 64;
  const paddedLen = l + kCount;

  const m = new Uint8Array(paddedLen);
  m.set(utf8);
  m[mLen] = 0x80;

  const dataView = new DataView(m.buffer);
  dataView.setUint32(paddedLen - 4, bitLen, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let i = 0; i < paddedLen; i += 64) {
    const w = new Uint32Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] = dataView.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 80; j++) {
      w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4;

    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rol(a, 5) + f + e + k + w[j]) | 0;
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4]
    .map((x) => (x >>> 0).toString(16).padStart(8, "0"))
    .join("");
}

export function sha256(message) {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  const utf8 = new TextEncoder().encode(message);
  const mLen = utf8.length;
  const bitLen = mLen * 8;

  const l = mLen + 1 + 8;
  const kCount = (64 - (l % 64)) % 64;
  const paddedLen = l + kCount;

  const m = new Uint8Array(paddedLen);
  m.set(utf8);
  m[mLen] = 0x80;

  const dataView = new DataView(m.buffer);
  dataView.setUint32(paddedLen - 4, bitLen, false);

  for (let i = 0; i < paddedLen; i += 64) {
    const w = new Uint32Array(64);
    for (let j = 0; j < 16; j++) {
      w[j] = dataView.getUint32(i + j * 4, false);
    }

    for (let j = 16; j < 64; j++) {
      const s0 =
        ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^
        ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^
        (w[j - 15] >>> 3);
      const s1 =
        ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^
        ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^
        (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = H[0],
      b = H[1],
      c = H[2],
      d = H[3],
      e = H[4],
      f = H[5],
      g = H[6],
      h = H[7];

    for (let j = 0; j < 64; j++) {
      const S1 =
        ((e >>> 6) | (e << 26)) ^
        ((e >>> 11) | (e << 21)) ^
        ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 =
        ((a >>> 2) | (a << 30)) ^
        ((a >>> 13) | (a << 19)) ^
        ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  let hex = "";
  for (let i = 0; i < 8; i++) {
    hex += (H[i] >>> 0).toString(16).padStart(8, "0");
  }
  return hex;
}

export const algorithms = [
  {
    id: "fnv1",
    name: "FNV-1",
    fn: fnv1_64,
    type: "non-cryptographic",
    bits: 64,
  },
  {
    id: "fnv1a",
    name: "FNV-1a",
    fn: fnv1a_64,
    type: "non-cryptographic",
    bits: 64,
  },
  {
    id: "murmur3",
    name: "MurmurHash3",
    fn: murmurHash3,
    type: "non-cryptographic",
    bits: 32,
  },
  { id: "md5", name: "MD5", fn: md5, type: "cryptographic", bits: 128 },
  { id: "sha1", name: "SHA-1", fn: sha1, type: "cryptographic", bits: 160 },
  {
    id: "sha256",
    name: "SHA-256",
    fn: sha256,
    type: "cryptographic",
    bits: 256,
  },
];
