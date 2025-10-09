//function
function logger0(log) {
  console.log(log);
}
logger0("Message....Helloo logger0");

//
const logger1 = function (log) {
  console.log(log);
};
logger1("Message....Helloo logger1");

//Arrow Function
const logger2 = (log) => {
  console.log(log);
};
logger2("Message....Helloo logger2");

const sum = (a, b) => {
  return a + b;
};
console.log("sum=" + sum(2, 2));

const sum1 = (a, b) => a + b;
console.log("sum1=" + sum(2, 3));

const sum2 = (a, b) => {
  return {
    a: a,
    b: b,
  };
};
console.log(sum2(2, 2));
