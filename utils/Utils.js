module.exports.getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
}

module.exports.getRandomColor = () => {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
