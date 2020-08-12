const fs = require("fs");

const {
  isOperand,
  isOperator,
  getIdxFromChar,
  operationMap,
} = require("./utils");

fs.readFile("things.csv", "utf8", function (err, data) {
  const dataArray = data.split(/\r?\n/).map((r) => r.split(","));

  let resultArray = [];
  for (let i = 0; i < dataArray.length; i++) {
    resultArray[i] = [];
    for (let j = 0; j < dataArray[i].length; j++) {
      const result = evaluatePostFix(dataArray[i][j], dataArray, resultArray);
      resultArray[i][j] = result;
    }
  }

  // TODO: write it to a file if we want
  console.log(resultArray);
});

// expression: 'B1 B2 +'
function evaluatePostFix(expression, dataArray, resultArray) {
  const stack = [];
  // split the string to array
  // ['B1', 'B2', '+']
  const tokenArray = expression.split(" ");

  for (let i = 0; i < tokenArray.length; i++) {
    let token = tokenArray[i];
    if (isOperand(token)) {
      // If it's an operand, keep collecting it into the stack
      stack.push(Number(token));
    } else if (isOperator(token)) {
      // let's try to pop our operands, and perform operation on them
      const op2 = stack.pop();
      const op1 = stack.pop();

      if (op1 === undefined || op2 === undefined) {
        // We don't have any Number type to operate on
        // NOTE: this operands checks can be don inside each function in operation map
        return "#ERR";
      }
      try {
        res = operationMap[token](op1, op2);
      } catch {
        // we bail out of the stack operation if err is thrown, and return '#ERR'
        return "#ERR";
      }

      // Push the result back to stack
      stack.push(res);
    } else if (/^[A-Z][0-9]$/.exec(token)) {
      // Extract col, row using regex Named capture groups
      const {
        groups: { col, row },
      } = /(?<col>^[A-Z])(?<row>\d$)/.exec(token);

      const colIdx = getIdxFromChar(col);

      // recursive call this evaluatePostFix and try to get the value using <col><row>
      const exp = dataArray[row - 1][colIdx];

      // before calling recursively, let's check if we have stored that into our result array
      let recursiveResult;
      if (Array.isArray(resultArray[row - 1]) && resultArray[row - 1][colIdx]) {
        recursiveResult = resultArray[row - 1][colIdx];
      } else {
        recursiveResult = evaluatePostFix(exp, dataArray, resultArray);
      }

      stack.push(recursiveResult);
    } else {
      return "#ERR";
    }
  }

  //NOTE:  missing operator: '1 2'; '1' is valid though
  if (stack.length >= 2) return "#ERR";

  // return the top of stac
  return stack[stack.length - 1];
}
