import api from "./api"

export interface DsaTestCase {
  input: string
  expectedOutput: string
  explanation?: string
  isHidden?: boolean
}

export interface DsaProblem {
  id: string
  slug: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  acceptanceRate: string
  companies: string[]
  leetcodeNumber: number
  description: string
  examples: {
    input: string
    output: string
    explanation?: string
  }[]
  constraints: string[]
  starterCode: {
    python: string
    javascript: string
    typescript: string
    java: string
    cpp: string
  }
  testCases: DsaTestCase[]
  hints: string[]
}

export interface CodeEvaluationResult {
  passed: boolean
  status: "Accepted" | "Wrong Answer" | "Runtime Error" | "Syntax Error" | "Time Limit Exceeded"
  runtimeMs: number
  memoryMb: number
  beatsPercent?: number
  testResults: {
    input: string
    expected: string
    actual: string
    passed: boolean
    error?: string
  }[]
  failedTestCase?: {
    input: string
    expected: string
    actual: string
    error?: string
  }
  aiErrorAnalysis?: string
  hint?: string
  xpEarned?: number
  nextProblem?: {
    id: string
    slug: string
    title: string
    difficulty: string
  }
}

export const FALLBACK_DSA_PROBLEMS: DsaProblem[] = [
  {
    id: "dsa-1",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hashing",
    acceptanceRate: "52.4%",
    companies: ["Google", "Meta", "Amazon", "Apple", "Microsoft"],
    leetcodeNumber: 1,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    starterCode: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution below:
        pass
`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution below:
    
}
`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
    // Write your solution below:
    
}
`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution below:
        return new int[]{};
    }
}
`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution below:
        return {};
    }
};
`,
    },
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", expectedOutput: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", expectedOutput: "[1,2]" },
      { input: "nums = [3,3], target = 6", expectedOutput: "[0,1]" },
    ],
    hints: [
      "A brute force approach checks all pairs in O(N^2) time.",
      "Can you use a Hash Map (Dictionary) to look up the complement (target - num) in O(1) time?",
      "Store each number's index as you iterate through the list.",
    ],
  },
  {
    id: "dsa-2",
    slug: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "Two Pointers",
    acceptanceRate: "47.1%",
    companies: ["Meta", "Amazon", "Microsoft", "Uber"],
    leetcodeNumber: 125,
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
      },
    ],
    constraints: [
      "1 <= s.length <= 2 * 10^5",
      "s consists only of printable ASCII characters.",
    ],
    starterCode: {
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Write your solution below:
        pass
`,
      javascript: `function isPalindrome(s) {
    // Write your solution below:
    
}
`,
      typescript: `function isPalindrome(s: string): boolean {
    // Write your solution below:
    
}
`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        return false;
    }
}
`,
      cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        return false;
    }
};
`,
    },
    testCases: [
      { input: 's = "A man, a plan, a canal: Panama"', expectedOutput: "true" },
      { input: 's = "race a car"', expectedOutput: "false" },
    ],
    hints: [
      "Two pointers: place one at the start and one at the end.",
      "Skip non-alphanumeric characters.",
      "Compare characters in lowercase.",
    ],
  },
  {
    id: "dsa-3",
    slug: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Sliding Window",
    acceptanceRate: "54.8%",
    companies: ["Amazon", "Google", "Microsoft"],
    leetcodeNumber: 121,
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i-th\` day. Return *the maximum profit you can achieve from this transaction*.`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
      },
    ],
    constraints: [
      "1 <= prices.length <= 10^5",
      "0 <= prices[i] <= 10^4",
    ],
    starterCode: {
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        pass
`,
      javascript: `function maxProfit(prices) {
    
}
`,
      typescript: `function maxProfit(prices: number[]): number {
    
}
`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        return 0;
    }
}
`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        return 0;
    }
};
`,
    },
    testCases: [
      { input: "prices = [7,1,5,3,6,4]", expectedOutput: "5" },
    ],
    hints: [
      "Track minimum price seen so far.",
      "Calculate profit at each day.",
    ],
  },
]

export const dsaService = {
  async getProblems(): Promise<DsaProblem[]> {
    try {
      const res = await api.get("/dsa/problems")
      if (res.data?.problems && res.data.problems.length > 0) {
        return res.data.problems
      }
      return FALLBACK_DSA_PROBLEMS
    } catch {
      return FALLBACK_DSA_PROBLEMS
    }
  },

  async getProblem(id: string): Promise<DsaProblem> {
    try {
      const res = await api.get(`/dsa/problems/${id}`)
      if (res.data?.problem) {
        return res.data.problem
      }
      return (
        FALLBACK_DSA_PROBLEMS.find((p) => p.id === id || p.slug === id) ||
        FALLBACK_DSA_PROBLEMS[0]
      )
    } catch {
      return (
        FALLBACK_DSA_PROBLEMS.find((p) => p.id === id || p.slug === id) ||
        FALLBACK_DSA_PROBLEMS[0]
      )
    }
  },

  async runCode(problemId: string, code: string, language: string): Promise<CodeEvaluationResult> {
    try {
      const res = await api.post("/dsa/run", {
        problemId,
        code,
        language,
      })
      return res.data
    } catch {
      return {
        passed: false,
        status: "Runtime Error",
        runtimeMs: 0,
        memoryMb: 0,
        testResults: [],
        aiErrorAnalysis: "Could not evaluate code. Please verify the API server is active.",
      }
    }
  },

  async submitCode(problemId: string, code: string, language: string): Promise<CodeEvaluationResult> {
    try {
      const res = await api.post("/dsa/submit", {
        problemId,
        code,
        language,
      })
      return res.data
    } catch {
      return {
        passed: false,
        status: "Runtime Error",
        runtimeMs: 0,
        memoryMb: 0,
        testResults: [],
        aiErrorAnalysis: "Submission failed. Please check server connectivity.",
      }
    }
  },
}

export default dsaService
