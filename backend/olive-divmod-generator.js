// const generateDivmod = (a, b) => {
//   const quotient = Math.floor(a / b);
//   const remainder = a % b;
//   return [quotient, remainder];
// };

const generateDivmod =
`
  const quotient = Math.floor(a / b);
  const remainder = a % b;
  return [quotient, remainder];
`;

module.exports = { generateDivmod };
