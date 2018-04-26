const generateMatrixFromRange = (inclusiveStart, start, step, end, inclusiveEnd) => {
  const positiveStep = step > 0;
  if (positiveStep ? end - start < 0 : end - start > 0) {
    throw new Error('Range expression generator values are invalid');
  }
  let generatorStart;
  let generatorEnd;
  let generatorInclusiveEnd;
  let generatorInclusiveStart; // TODO: deal with exclusive start
  if (positiveStep) {
    generatorStart = start;
    generatorEnd = end;
  } else {
    generatorInclusiveEnd = inclusiveStart;
    generatorInclusiveStart = inclusiveEnd;
    generatorStart = end;
    generatorEnd = start;
  }
  // TODO: deal with the negative step case
  const result = [];
  let currentVal = generatorStart;
  const test = () => {
    if (generatorInclusiveEnd) {
      return currentVal <= generatorEnd;
    }
    return currentVal < generatorEnd;
  };
  while (test()) {
    result.push(currentVal);
    currentVal += Math.abs(step);
  }
  return positiveStep ? result : result.reverse();
};

module.exports = { generateMatrixFromRange };
