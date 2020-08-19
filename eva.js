const csvParser = require("./parser/csv-parser");
const {
  isOperand,
  isOperator,
  getIdxFromChar,
  operationMap,
} = require("./utils");

class Eva {
  constructor() {
    this.data = [];
    this.result = [];
  }

  eval(path, separator = ",", notation = "postfix") {
    try {
      this.data = csvParser(path);
      for (let i = 0; i < this.data.length; i++) {
        this.result[i] = [];
        for (let j = 0; j < this.data[i].length; j++) {
          const result = this.evalExpression(this.data[i][j], notation);
          this.result[i][j] = result;
        }
      }
    } catch (error) {
      console.error(error.message);
    }
    return this.result;
  }

  // TODO: we can handle other notation too
  evalExpression(expression, notation) {
    const stack = [];
    // split the string to array
    // ['B1', 'B2', '+']
    const tokenArray = expression.split(" ");
    let res;

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
        } catch (error) {
          console.error(error);
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

        // recursive call this evalExpression and try to get the value using <col><row>
        const exp = this.data[row - 1][colIdx];

        // before calling recursively, let's check if we have stored that into our result array
        let recursiveResult;
        if (
          Array.isArray(this.result[row - 1]) &&
          this.result[row - 1][colIdx]
        ) {
          recursiveResult = this.result[row - 1][colIdx];
        } else {
          recursiveResult = this.evalExpression(exp);
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
}

module.exports = Eva;
