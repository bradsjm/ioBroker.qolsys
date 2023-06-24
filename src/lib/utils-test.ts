/*
Code Analysis

Objective:
The objective of the 'convertToTitleCase' function is to convert a given string to title case format, where the first letter of each word is capitalized and the rest of the letters are in lowercase. The function can handle various types of input strings, including those with underscores, hyphens, and mixed cases.

Inputs:
- 'str': a string that needs to be converted to title case format.

Flow:
1. Replace all underscores and hyphens in the input string with spaces.
2. Trim any leading or trailing spaces in the input string.
3. Use a regular expression to match each word in the input string and capitalize its first letter while keeping the rest of the letters in lowercase.
4. Use regular expressions to add spaces between words that were previously in camelCase or PascalCase format.

Outputs:
- A string in title case format, where the first letter of each word is capitalized and the rest of the letters are in lowercase.

Additional aspects:
- The function uses regular expressions to match and manipulate the input string, making it efficient and scalable.
- The function does not modify the original input string, but returns a new string in title case format.
- The function can handle various types of input strings, including those with underscores, hyphens, and mixed cases.
*/

import { expect } from "chai";
import { convertToTitleCase } from "./utils";

describe("convertToTitleCase", () => {

    // Tests that the function correctly converts a string with no special characters to title case
    it("test_happy_path_no_special_chars", () => {
        const input = "yourStringHere";
        const expectedOutput = "Your String Here";
        const actualOutput = convertToTitleCase(input);
        expect(actualOutput).to.equal(expectedOutput);
    });

    // Tests that the function correctly converts a string with special characters to title case
    it("test_happy_path_with_special_chars", () => {
        const input = "Another-String-Here";
        const expectedOutput = "Another String Here";
        const actualOutput = convertToTitleCase(input);
        expect(actualOutput).to.equal(expectedOutput);
    });

    // Tests that the function returns an empty string when given an empty string input
    it("test_edge_case_empty_string", () => {
        const input = "";
        const expectedOutput = "";
        const actualOutput = convertToTitleCase(input);
        expect(actualOutput).to.equal(expectedOutput);
    });

    // Tests that the function correctly converts a string with only numbers to title case
    it("test_edge_case_numbers_only", () => {
        const input = "1234567890";
        const expectedOutput = "1234567890";
        const actualOutput = convertToTitleCase(input);
        expect(actualOutput).to.equal(expectedOutput);
    });

    // Tests that the function returns an empty string when given a string with only whitespace characters
    it("test_edge_case_whitespace_only", () => {
        const input = "     ";
        const expectedOutput = "";
        const actualOutput = convertToTitleCase(input);
        expect(actualOutput).to.equal(expectedOutput);
    });

});
