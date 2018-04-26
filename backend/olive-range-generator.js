// const assert = require('assert');

// const generateMatrixFromRange =
// `const generateMatrixFromRange = (inclusiveStart, start, step, end, inclusiveEnd) => {
//   const positiveStep = step > 0;
//   if (positiveStep ? end - start < 0 : end - start > 0) {
//     throw new Error('Range expression generator values are invalid');
//   }
//   const result = [];
//   let currentVal = inclusiveStart ? start : start + step;
//   const test = (pos) => {
//     if (inclusiveEnd) {
//       return pos ? currentVal <= end : currentVal >= end;
//     }
//     return pos ? currentVal < end : currentVal > end;
//   };
//   while (test(positiveStep)) {
//     result.push(currentVal);
//     currentVal += step;
//   }
//   return result;
// };`;

const generateMatrixFromRange =
`
  const positiveStep = step > 0;
  if (positiveStep ? end - start < 0 : end - start > 0) {
    throw new Error('Range expression generator values are invalid');
  }
  const result = [];
  let currentVal = inclusiveStart ? start : start + step;
  const test = (pos) => {
    if (inclusiveEnd) {
      return pos ? currentVal <= end : currentVal >= end;
    }
    return pos ? currentVal < end : currentVal > end;
  };
  while (test(positiveStep)) {
    result.push(currentVal);
    currentVal += step;
  }
  return result;
`;

// assert.deepEqual(generateMatrixFromRange(true, 1, 1, 5, true), [1, 2, 3, 4, 5]);
// assert.deepEqual(generateMatrixFromRange(true, 1, 1, 5, false), [1, 2, 3, 4]);
// assert.deepEqual(generateMatrixFromRange(false, 1, 1, 5, true), [2, 3, 4, 5]);
// assert.deepEqual(generateMatrixFromRange(false, 1, 1, 5, false), [2, 3, 4]);
//
// assert.deepEqual(generateMatrixFromRange(true, 3, -0.5, 1, true), [3, 2.5, 2, 1.5, 1]);
// assert.deepEqual(generateMatrixFromRange(true, 3, -0.5, 1, false), [3, 2.5, 2, 1.5]);
// assert.deepEqual(generateMatrixFromRange(false, 3, -0.5, 1, true), [2.5, 2, 1.5, 1]);
// assert.deepEqual(generateMatrixFromRange(false, 3, -0.5, 1, false), [2.5, 2, 1.5]);

module.exports = { generateMatrixFromRange };
