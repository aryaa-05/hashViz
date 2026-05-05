# Hash Visualizer - Comprehensive Documentation

This document explains the architecture, underlying math, algorithms, and data flow of the Hash Visualizer project. The project is designed to give an intuitive, visual understanding of how different hashing algorithms function, specifically focusing on the **Avalanche Effect** and **Computational Performance**.

---

## 1. Overview of Hashing Algorithms

The application implements six hashing algorithms from scratch in pure JavaScript (`src/utils/hashAlgorithms.js`). These are divided into two categories: non-cryptographic (designed for speed and hash table lookup) and cryptographic (designed for security and collision resistance).

### Non-Cryptographic Hashes
These hashes are designed to be extremely fast and provide a good uniform distribution of bits, but they are not secure against intentional collision attacks.

*   **FNV-1 (Fowler–Noll–Vo 1 - 64-bit)**
    *   **How it works:** Initializes a hash with an offset basis. For each byte of input, it first multiplies the hash by a large prime number (FNV prime), then XORs it with the input byte.
    *   **Characteristics:** Extremely simple and fast. However, due to the order of operations, it has slight weaknesses in the lowest bits.
*   **FNV-1a (64-bit)**
    *   **How it works:** A slight variation of FNV-1. It reverses the core loop: it first XORs the input byte, *then* multiplies by the FNV prime.
    *   **Characteristics:** This minor tweak drastically improves the avalanche characteristics of the hash, making it widely preferred over FNV-1.
*   **MurmurHash3 (32-bit)**
    *   **How it works:** Processes input in 4-byte chunks. It uses a series of bitwise shifts, multiplications by magic constants, and XORs to heavily scramble the data ("murmur" stands for multiply and rotate). At the end, it uses a finalizer mix (fmix) to ensure even small inputs cascade across all 32 bits.
    *   **Characteristics:** Extremely fast with excellent distribution. Widely used in databases and hash tables.

### Cryptographic Hashes
These hashes are designed to be one-way (irreversible) and highly resistant to collisions (two inputs producing the same output).

*   **MD5 (128-bit)**
    *   **How it works:** Processes data in 512-bit blocks. It uses 64 rounds of non-linear functions (AND, OR, NOT, XOR), modular additions, and left-rotations.
    *   **Characteristics:** Historically popular but now considered cryptographically broken due to vulnerabilities to collision attacks. It remains useful as a checksum.
*   **SHA-1 (160-bit)**
    *   **How it works:** Similar block structure to MD5 but expands the data into 80 rounds of bitwise operations and incorporates a message schedule.
    *   **Characteristics:** More secure than MD5 but also officially deprecated by institutions like NIST, as targeted collision attacks are now computationally feasible.
*   **SHA-256 (256-bit)**
    *   **How it works:** Part of the SHA-2 family. It uses complex bitwise operations including `Ch` (Choose), `Maj` (Majority), and specific bit-rotations ($\Sigma_0, \Sigma_1$) across 64 rounds.
    *   **Characteristics:** The current industry standard for security. It is heavily relied upon in SSL/TLS, blockchain (Bitcoin), and secure password hashing.

---

## 2. What is Voronoi and Why Are We Using It?

### What is a Voronoi Diagram?
A Voronoi diagram is a geometric partitioning of a plane into regions based on distance to a specific set of points (called "seeds"). For each seed, there is a corresponding region consisting of all pixels closer to that seed than to any other.

### Why use Voronoi for Hash Visualization?
Text-based hash outputs (like `e3b0c442...`) are difficult for human brains to quickly compare. We use Voronoi diagrams to map the "entropy" (randomness) of a hash into a distinct visual footprint:
1.  **Bit-to-Geometry Mapping:** We slice the resulting hash into chunks of bits. We use these bits to deterministically generate X and Y coordinates, as well as Hue (color) values for seed points.
2.  **Visualizing the Avalanche Effect:** The Avalanche Effect dictates that changing a single bit of input should flip roughly 50% of the output bits. When the output bits change, the generated coordinates move wildly. Therefore, a 1-character change in text results in a completely unique, unrecognizable Voronoi diagram. 
3.  **Visualizing Entropy:** Smaller hashes (like 32-bit MurmurHash) have less internal state, producing fewer distinct chunks. The visualization naturally reflects this by generating fewer, larger tiles compared to the high-density, chaotic cellular structure of a 256-bit SHA hash.

---

## 3. Data Flow and Architecture

The application is built using React and follows a strict one-way data flow model.

### 1. User Input & State Management (`App.jsx`)
*   The application maintains state for the primary text input, a secondary text input (for comparison), and the currently selected hashing algorithm.
*   When the user types, `useMemo` hooks automatically recalculate `hash1` and `hash2` using the selected algorithm from `hashAlgorithms.js`.

### 2. Statistical Analysis (`App.jsx`)
*   **Hamming Distance Calculation:** The app calculates the bit-level difference between `hash1` and `hash2`. It converts both hex strings to binary, pads them, and counts how many bits flipped. An ideal hash will achieve ~50% bit flip for any single character change.

### 3. Visual Generation (`HashVisualizer.jsx`)
*   The raw hex string is passed to the `<HashVisualizer />` component.
*   **Expansion & Padding:** Because 32-bit or 64-bit hashes don't have enough bits to generate 40+ coordinate points, the binary string is padded up to 2048 bits. To prevent the points from stacking exactly on top of each other, the padding logic uses an XOR mutation (`padIndex`) to ensure geometric variety while remaining 100% deterministic to the hash.
*   **Point Extraction:** The padded binary string is read in 8-bit chunks (0-255). These chunks are scaled to determine the (X, Y) positions and colors of the seeds. Duplicate coordinates are filtered out to prevent division-by-zero boundary errors.
*   **Canvas Rendering:** A brute-force nearest-neighbor algorithm loops over every pixel of the canvas, calculates the Euclidean distance to every seed point, and determines:
    *   If the pixel is roughly equidistant to the two closest points (`dist2 - dist1 < 1.5`), it is painted as an edge.
    *   Otherwise, it is painted with the color of the closest point, with a radial gradient effect applied for depth.

---

## 4. Benchmarking Analysis

### What is Benchmarking?
Benchmarking is the act of measuring the performance and computational cost of executing a block of code. In this app, we benchmark how long it takes to generate thousands of hashes.

### How Do We Calculate It?
When the user clicks "Run Benchmark", the app:
1.  Loops through every available algorithm.
2.  Records the precise start time using `performance.now()`.
3.  Executes the hash function **5,000 times** in a tight loop. 
    *   *Note: Inside the loop, the input is slightly mutated (`input1 + i`) to prevent modern JavaScript engines (like V8) from optimizing away identical function calls.*
4.  Records the end time and calculates the elapsed milliseconds.

### Why Benchmark Hashes?
Hashes serve different purposes, and speed is a massive factor:
*   **Non-Cryptographic Hashes (FNV, Murmur):** Expected to be blazingly fast. They are used in Hash Maps/Dictionaries where millions of keys need to be hashed per second. If they are slow, the entire software slows down.
*   **Cryptographic Hashes (SHA-256):** Expected to be relatively slow. A slower execution time acts as a defense mechanism against Brute Force and Dictionary attacks. If a hacker tries to guess a password by hashing billions of possibilities, the computational complexity of SHA-256 severely bottlenecks their attempts.
