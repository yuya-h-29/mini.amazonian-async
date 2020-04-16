/**
 * YOU SHALL NOT MODIFY THIS FILE!
 */

const fs = require("fs");

// for promises and async/await
const readFile = (name) =>
  new Promise((resolve, reject) => {
    fs.readFile(name, "utf8", (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });

// common method to join all data and format and return result
const produceResult = (allData) => {
  const { products, users, reviews } = allData;
  const productsMap = {};

  products.forEach((product) => {
    productsMap[product.id] = product.name;
  });

  const usersMap = {};
  users.forEach((user) => {
    usersMap[user.id] = user.username;
  });

  return reviews.map((review) => {
    const productObj = {
      productName: productsMap[review.productId],
      username: usersMap[review.userId],
      text: review.text,
      rating: review.rating,
    };
    return productObj;
  });
};

module.exports = { readFile, produceResult };
