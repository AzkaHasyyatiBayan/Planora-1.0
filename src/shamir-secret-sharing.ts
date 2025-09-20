interface Root {
  base: string;
  value: string;
}

interface TestCase {
  n: number;
  k: number;
  roots: { [key: string]: Root };
}

interface DecodedPoint {
  x: number;
  y: number;
}

// Function to convert value from any base to decimal
function convertToDecimal(value: string, base: number): number {
  return parseInt(value, base);
}

// Function to decode the test case JSON
function decodeTestCase(jsonString: string): TestCase {
  return JSON.parse(jsonString);
}

// Lagrange interpolation to find polynomial value at x=0 (constant term)
function lagrangeInterpolation(points: DecodedPoint[], targetX: number = 0): number {
  let result = 0;

  for (let i = 0; i < points.length; i++) {
    const { x: xi, y: yi } = points[i];

    // Calculate numerator and denominator for Lagrange basis polynomial
    let numerator = 1;
    let denominator = 1;

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        const { x: xj } = points[j];
        numerator *= (targetX - xj);
        denominator *= (xi - xj);
      }
    }

    // Add the term to the result
    result += yi * (numerator / denominator);
  }

  return Math.round(result);
}

// Main function to solve Shamir's Secret Sharing
function findSecret(testCaseJson: string): number {
  const testCase = decodeTestCase(testCaseJson);

  // Convert roots to points with decimal values
  const points: DecodedPoint[] = Object.entries(testCase.roots)
    .map(([xStr, root]) => {
      const x = parseInt(xStr);
      const y = convertToDecimal(root.value, parseInt(root.base));
      return { x, y };
    });

  // Use k points for interpolation (as required by the problem)
  const pointsToUse = points.slice(0, testCase.k);

  // Find the constant term (secret) using Lagrange interpolation at x=0
  const secret = lagrangeInterpolation(pointsToUse, 0);

  return secret;
}

// Test cases from the problem
const testCase1 = `{
  "n": 4,
  "k": 3,
  "roots": {
    "1": {
      "base": "10",
      "value": "4"
    },
    "2": {
      "base": "10",
      "value": "11112"
    },
    "3": {
      "base": "10",
      "value": "69420"
    },
    "6": {
      "base": "10",
      "value": "36288000"
    }
  }
}`;

const testCase2 = `{
  "n": 10,
  "k": 7,
  "roots": {
    "1": {
      "base": "6",
      "value": "1344421144"
    },
    "2": {
      "base": "15",
      "value": "aed7015a"
    },
    "3": {
      "base": "15",
      "value": "1a228938"
    },
    "4": {
      "base": "16",
      "value": "123456789abcdef0"
    },
    "5": {
      "base": "8",
      "value": "1234567"
    },
    "6": {
      "base": "9",
      "value": "987654321"
    },
    "7": {
      "base": "12",
      "value": "abcdef"
    },
    "8": {
      "base": "11",
      "value": "135791113"
    },
    "9": {
      "base": "2",
      "value": "10101010101010101010101010101010101010101010101010"
    },
    "10": {
      "base": "3",
      "value": "121011122021022110221202102"
    }
  }
}`;

// Solve both test cases
console.log("Test Case 1 Secret:", findSecret(testCase1));
console.log("Test Case 2 Secret:", findSecret(testCase2));

// Export functions for potential reuse
export { findSecret, decodeTestCase, convertToDecimal, lagrangeInterpolation };
