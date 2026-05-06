# Hash Visualizer - Comprehensive Documentation

This document explains the architecture, underlying math, algorithms, and data flow of the Hash Visualizer project. The project is designed to give an intuitive, visual understanding of how different hashing algorithms function, specifically focusing on the **Avalanche Effect** and **Computational Performance**.

---

## 1. Overview of Hashing Algorithms

The application implements six hashing algorithms in pure JavaScript (`src/utils/hashAlgorithms.js`). These are divided into two categories: non-cryptographic (designed for speed and hash table lookup) and cryptographic (designed for security and collision resistance).

### Non-Cryptographic Hashes

These hashes are designed to be extremely fast and provide a good uniform distribution of bits, but they are not secure against intentional collision attacks.

- **FNV-1 (Fowler–Noll–Vo 1 - 64-bit)**
  - **How it works:** Initializes a hash with an offset basis. For each byte of input, it first multiplies the hash by a large prime number (FNV prime), then XORs it with the input byte.
  - **Characteristics:** Extremely simple and fast. However, due to the order of operations, it has slight weaknesses in the lowest bits.

- **FNV-1a (64-bit)**
  - **How it works:** A slight variation of FNV-1. It reverses the core loop: it first XORs the input byte, *then* multiplies by the FNV prime.
  - **Characteristics:** This minor tweak drastically improves the avalanche characteristics of the hash, making it widely preferred over FNV-1.

- **MurmurHash3 (32-bit)**
  - **How it works:** Processes input in 4-byte chunks. It uses a series of bitwise shifts, multiplications by magic constants, and XORs to heavily scramble the data ("murmur" stands for multiply and rotate). At the end, it uses a finalizer mix (fmix) to ensure even small inputs cascade across all 32 bits.
  - **Characteristics:** Extremely fast with excellent distribution. Widely used in databases and hash tables.

### Cryptographic Hashes

These hashes are designed to be one-way (irreversible) and highly resistant to collisions (two inputs producing the same output).

---

### MD5 (128-bit)

#### How it Works

MD5 takes an input message of variable length and produces a fixed 128-bit hash value. The algorithm processes data in 512-bit blocks using multiple rounds of bitwise and mathematical operations.

##### 1. Input Message

- Take the input message of any length.
- Convert the message into binary/UTF-8 byte format.

##### 2. Padding

The message is padded to make its length compatible with MD5's block-processing structure.

- Append a single `1` bit (`10000000` or `0x80`).
- Append `0` bits until the message length becomes `448 mod 512`.
- Append the original message length as a 64-bit value.
- The final padded message length becomes a multiple of 512 bits.

##### 3. Initialize Buffer Variables

MD5 initializes four 32-bit buffer variables with predefined constants:

```
A = 0x67452301
B = 0xefcdab89
C = 0x98badcfe
D = 0x10325476
```

##### 4. Divide into Blocks

- The padded message is divided into 512-bit blocks.
- Each block is further divided into sixteen 32-bit words:

```
M[0] to M[15]
```

##### 5. Perform 64 Rounds of Operations

For each block, MD5 performs 64 rounds of processing.

In every round:

- A nonlinear function `F` is calculated.
- A message word index `g` is selected.
- Predefined constants `K[i]` are used.
- Left rotation values `s[i]` are applied.

Main operation:

```
temp = D
D = C
C = B
B = B + rol((A + F + K[i] + M[g]), s[i])
A = temp
```

Where:

- `rol()` represents left rotation.
- `K[i]` constants are generated using:

```
K[i] = floor(2^32 × abs(sin(i + 1)))
```

##### 6. Update Final Buffers

After all 64 rounds:

```
A = A + a0
B = B + b0
C = C + c0
D = D + d0
```

These updated values become the new internal state.

##### 7. Generate Final Hash

- Combine the final values of `A`, `B`, `C`, and `D`.
- Convert the 128-bit result into hexadecimal format.
- Output the final MD5 hash.

#### Characteristics

- Produces a 128-bit hash value.
- Fast and historically very popular.
- Vulnerable to collision attacks and no longer considered secure for cryptographic purposes.
- Still commonly used for checksums and file integrity verification.

---

### SHA-1 (160-bit)

#### How it Works

SHA-1 takes an input message of variable length and produces a fixed 160-bit hash value. It follows a structure similar to MD5 but performs more rounds and uses a larger internal state for improved security.

##### 1. Input Message

- Take the input message of any length.
- Convert the message into binary/UTF-8 byte format.

##### 2. Padding

The message is padded before processing.

- Append a single `1` bit (`10000000` or `0x80`).
- Append `0` bits until the message length becomes `448 mod 512`.
- Append the original message length as a 64-bit value.
- The final padded message length becomes a multiple of 512 bits.

##### 3. Initialize Buffer Variables

SHA-1 initializes five 32-bit buffer variables:

```
A = 0x67452301
B = 0xEFCDAB89
C = 0x98BADCFE
D = 0x10325476
E = 0xC3D2E1F0
```

##### 4. Divide into Blocks

- The padded message is divided into 512-bit blocks.
- Each block is divided into sixteen 32-bit words.
- These 16 words are expanded into 80 words using XOR and left rotation operations.

```
W[0] to W[79]
```

##### 5. Perform 80 Rounds of Operations

For each block, SHA-1 performs 80 rounds of processing.

In every round:

- A nonlinear function `F` is selected based on the round number.
- A constant `K` is used.
- Bitwise operations and left rotations are applied.

Main operation:

```
temp = rol(A,5) + F(B,C,D) + E + K + W[i]

E = D
D = C
C = rol(B,30)
B = A
A = temp
```

Where:

- `rol()` represents left rotation.
- Different nonlinear functions are used in different round ranges.

##### 6. Update Final Buffers

After all 80 rounds:

```
A = A + a0
B = B + b0
C = C + c0
D = D + d0
E = E + e0
```

##### 7. Generate Final Hash

- Combine the final values of `A`, `B`, `C`, `D`, and `E`.
- Convert the 160-bit result into hexadecimal format.
- Output the final SHA-1 hash.

#### Characteristics

- Produces a 160-bit hash value.
- More secure than MD5.
- Vulnerable to collision attacks and officially deprecated for secure cryptographic use.
- Previously used in SSL certificates, Git, and file verification systems.

---

### SHA-256 (256-bit)

#### How it Works

SHA-256 is part of the SHA-2 family and generates a fixed 256-bit hash value. It uses stronger mathematical operations and a larger internal state than MD5 and SHA-1.

##### 1. Input Message

- Take the input message of any length.
- Convert the message into binary/UTF-8 byte format.

##### 2. Padding

The message is padded before processing.

- Append a single `1` bit (`10000000` or `0x80`).
- Append `0` bits until the message length becomes `448 mod 512`.
- Append the original message length as a 64-bit value.
- The final padded message length becomes a multiple of 512 bits.

##### 3. Initialize Buffer Variables

SHA-256 initializes eight 32-bit hash values:

```
H0 = 0x6a09e667
H1 = 0xbb67ae85
H2 = 0x3c6ef372
H3 = 0xa54ff53a
H4 = 0x510e527f
H5 = 0x9b05688c
H6 = 0x1f83d9ab
H7 = 0x5be0cd19
```

##### 4. Divide into Blocks

- The padded message is divided into 512-bit blocks.
- Each block is divided into sixteen 32-bit words.
- These are expanded into 64 words using bitwise operations and rotations.

```
W[0] to W[63]
```

##### 5. Perform 64 Rounds of Operations

For each block, SHA-256 performs 64 rounds of processing.

In every round:

- Functions like `Ch` (Choose) and `Maj` (Majority) are used.
- Multiple right rotations and shifts are performed.
- Round constants `K[i]` are applied.

Main operations:

```
T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]
T2 = Σ0(a) + Maj(a,b,c)

h = g
g = f
f = e
e = d + T1
d = c
c = b
b = a
a = T1 + T2
```

Where:

- `Ch(x,y,z)` chooses bits from `y` or `z`.
- `Maj(x,y,z)` returns the majority bit.
- `Σ0` and `Σ1` are rotation-based functions.

##### 6. Update Final Hash Values

After all 64 rounds:

```
H0 = H0 + a
H1 = H1 + b
H2 = H2 + c
H3 = H3 + d
H4 = H4 + e
H5 = H5 + f
H6 = H6 + g
H7 = H7 + h
```

##### 7. Generate Final Hash

- Combine all final hash values.
- Convert the 256-bit result into hexadecimal format.
- Output the final SHA-256 hash.

#### Characteristics

- Produces a 256-bit hash value.
- Considered highly secure and collision-resistant.
- Widely used in SSL/TLS, digital signatures, blockchain systems, and password hashing.
- Currently the industry standard for secure hashing applications.

---

## 2. What is Voronoi and Why Are We Using It?

### What is a Voronoi Diagram?

A Voronoi diagram is a geometric partitioning of a plane into regions based on distance to a specific set of points (called "seeds"). For each seed, there is a corresponding region consisting of all pixels closer to that seed than to any other.

### Why use Voronoi for Hash Visualization?

Text-based hash outputs (like `e3b0c442...`) are difficult for human brains to quickly compare. We use Voronoi diagrams to map the "entropy" (randomness) of a hash into a distinct visual footprint:

1. **Bit-to-Geometry Mapping:** We slice the resulting hash into chunks of bits. We use these bits to deterministically generate X and Y coordinates, as well as Hue (color) values for seed points.
2. **Visualizing the Avalanche Effect:** The Avalanche Effect dictates that changing a single bit of input should flip roughly 50% of the output bits. When the output bits change, the generated coordinates move wildly. Therefore, a 1-character change in text results in a completely unique, unrecognizable Voronoi diagram.
3. **Visualizing Entropy:** Smaller hashes (like 32-bit MurmurHash) have less internal state, producing fewer distinct chunks. The visualization naturally reflects this by generating fewer, larger tiles compared to the high-density, chaotic cellular structure of a 256-bit SHA hash.

---

## 3. Data Flow and Architecture

The application is built using React and follows a strict one-way data flow model.

### 1. User Input & State Management (`App.jsx`)

- The application maintains state for the primary text input, a secondary text input (for comparison), and the currently selected hashing algorithm.
- When the user types, `useMemo` hooks automatically recalculate `hash1` and `hash2` using the selected algorithm from `hashAlgorithms.js`.

### 2. Statistical Analysis (`App.jsx`)

- **Hamming Distance Calculation:** The app calculates the bit-level difference between `hash1` and `hash2`. It converts both hex strings to binary, pads them, and counts how many bits flipped. An ideal hash will achieve ~50% bit flip for any single character change.

### 3. Visual Generation (`HashVisualizer.jsx`)

#### Step 1 — Hash Input

The hash is passed into the React component through `hashHex`. This hash becomes the base input for the entire visualization.

#### Step 2 — `hexToBin()`

Converts hexadecimal hash into binary bits.

- `hex.split('')` separates every hex character.
- `parseInt(char, 16)` converts hex → decimal.
- `.toString(2)` converts decimal → binary.
- `.padStart(4,'0')` ensures every hex digit becomes exactly 4 bits.
- All bits are joined into one long binary string.

#### Step 3 — Pad Binary Data

Extends the binary string to create more usable bits.

- A `while` loop keeps extending the binary data until `paddedBin.length < 2048`.
- The code `parseInt(chunk, 2) ^ (padIndex % 256)` uses XOR to generate mixed pseudo-random bits, which are appended back into `paddedBin`.
- **Why:** Original hashes are too short for generating many coordinates and colors.

#### Step 4 — `getParam()`

Extracts small numeric values from the binary data.

- `getParam(index)` calculates `start = (index * 8) % paddedBin.length`.
- Then extracts `paddedBin.substring(start, start + 8)`.
- Those 8 bits are converted into decimal numbers (`0`–`255`).
- **Why:** These values are later used for coordinates, hues, and point counts.

#### Step 5 — Generate Seed Points

Creates Voronoi seed points.

```js
const pX = (getParam(offset) / 255) * size
const pY = (getParam(offset + 1) / 255) * size
```

Maps extracted numbers into canvas coordinates. Each generated point contains an x position, y position, and hue, stored inside `points[]`.

#### Step 6 — Calculate Voronoi Regions

Determines which seed point each pixel belongs to.

- Nested loops check every pixel: `for(y) → for(x)`.
- For every pixel, distance to all points is calculated using squared Euclidean distance: `dx*dx + dy*dy`.
- The point with the smallest distance becomes the owner of that pixel.

#### Step 7 — Generate Colors using `hslToRgb()`

Converts generated hues into visible RGB colors.

- The nearest point's hue is passed into `hslToRgb(h, s, l)`.
- Lightness is adjusted using `dist1 / size`, creating brighter centers and darker edges with smooth gradients.
- HSL values are then converted into RGB pixel colors.

#### Step 8 — Render Pixels

Writes final RGB values into image memory.

- Each pixel stores R, G, B, A values inside `imgData.data`.
- `data[pixelIndex] = rgb[0]` writes color values directly into the image buffer.

#### Step 9 — Draw Seed Points

Draws visible circles at Voronoi centers using canvas functions:

```js
ctx.beginPath()
ctx.arc()
ctx.fill()
```

Small white circles are drawn at every seed point position.

#### Step 10 — Display Final Visualization

The final buffer is rendered using:

```js
ctx.putImageData(imgData, 0, 0)
```

React then displays the canvas component on screen. The result is a unique hash-based Voronoi fingerprint visualization.

---

## 4. Benchmarking Analysis

### What is Benchmarking?

Benchmarking is the act of measuring the performance and computational cost of executing a block of code. In this app, we benchmark how long it takes to generate thousands of hashes.

### How Do We Calculate It?

When the user clicks "Run Benchmark", the app:

1. Loops through every available algorithm.
2. Records the precise start time using `performance.now()`.
3. Executes the hash function **5,000 times** in a tight loop.
   - *Note: Inside the loop, the input is slightly mutated (`input1 + i`) to prevent modern JavaScript engines (like V8) from optimizing away identical function calls.*
4. Records the end time and calculates the elapsed milliseconds.

### Why Benchmark Hashes?

Hashes serve different purposes, and speed is a massive factor:

- **Non-Cryptographic Hashes (FNV, Murmur):** Expected to be blazingly fast. They are used in Hash Maps/Dictionaries where millions of keys need to be hashed per second. If they are slow, the entire software slows down.
- **Cryptographic Hashes (SHA-256):** Expected to be relatively slow. A slower execution time acts as a defense mechanism against brute force and dictionary attacks. If a hacker tries to guess a password by hashing billions of possibilities, the computational complexity of SHA-256 severely bottlenecks their attempts.
