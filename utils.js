const operationMap = {
  "+": (operand1, operand2) => operand1 + operand2,
  "-": (operand1, operand2) => operand1 - operand2,
  "*": (operand1, operand2) => operand1 * operand2,
  "/": (operand1, operand2) => {
    if (operand2 == 0) throw Error();
    return operand1 / operand2;
  },
};

function isOperand(symbol) {
  // NOTE: global 'isNaN' coerces the value to number using Number abstract operation, and then checks if returned value is 'NaN'
  return !isNaN(symbol);
}

function isOperator(symbol) {
  // If the symbol is part of the operationMap, then it's a valid operator
  return operationMap[symbol] !== undefined;
}

// Get idx representation
function getIdxFromChar(char) {
  return char.charCodeAt() - 65;
}

module.exports = {
  operationMap,
  isOperand,
  isOperator,
  getIdxFromChar,
};
