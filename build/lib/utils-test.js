"use strict";
var import_chai = require("chai");
var import_utils = require("./utils");
describe("convertToTitleCase", () => {
  it("test_happy_path_no_special_chars", () => {
    const input = "yourStringHere";
    const expectedOutput = "Your String Here";
    const actualOutput = (0, import_utils.convertToTitleCase)(input);
    (0, import_chai.expect)(actualOutput).to.equal(expectedOutput);
  });
  it("test_happy_path_with_special_chars", () => {
    const input = "Another-String-Here";
    const expectedOutput = "Another String Here";
    const actualOutput = (0, import_utils.convertToTitleCase)(input);
    (0, import_chai.expect)(actualOutput).to.equal(expectedOutput);
  });
  it("test_edge_case_empty_string", () => {
    const input = "";
    const expectedOutput = "";
    const actualOutput = (0, import_utils.convertToTitleCase)(input);
    (0, import_chai.expect)(actualOutput).to.equal(expectedOutput);
  });
  it("test_edge_case_numbers_only", () => {
    const input = "1234567890";
    const expectedOutput = "1234567890";
    const actualOutput = (0, import_utils.convertToTitleCase)(input);
    (0, import_chai.expect)(actualOutput).to.equal(expectedOutput);
  });
  it("test_edge_case_whitespace_only", () => {
    const input = "     ";
    const expectedOutput = "";
    const actualOutput = (0, import_utils.convertToTitleCase)(input);
    (0, import_chai.expect)(actualOutput).to.equal(expectedOutput);
  });
});
//# sourceMappingURL=utils-test.js.map
