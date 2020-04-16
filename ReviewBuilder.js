const fs = require("fs");
const util = require("util");
const pReadFile = util.promisify(fs.readFile);
const { readFile, produceResult } = require("./helpers");

class ReviewBuilder {
  buildReviewsSync() {
    const products = JSON.parse(
      fs.readFileSync("./data/products.json", "utf-8")
    );
    const reviews = JSON.parse(fs.readFileSync("./data/reviews.json", "utf-8"));
    const users = JSON.parse(fs.readFileSync("./data/users.json", "utf-8"));
    return produceResult({ products, reviews, users });
  }

  buildReviewsCallbacks(cb) {
    fs.readFile("./data/products.json", "utf8", (err, products) => {
      if (err) throw err;
      fs.readFile("./data/reviews.json", "utf8", (err, reviews) => {
        if (err) throw err;
        fs.readFile("./data/users.json", "utf8", (err, users) => {
          if (err) throw err;
          products = JSON.parse(products);
          reviews = JSON.parse(reviews);
          users = JSON.parse(users);
          cb(produceResult({ products, reviews, users }));
        });
      });
    });
  }

  buildReviewsPromises() {
    // readFile("./data/products.json").then((data) =>
    //   console.log(JSON.parse(data))
    // );

    return (
      Promise.all([
        readFile("./data/products.json"),
        readFile("./data/reviews.json"),
        readFile("./data/users.json"),
      ])
        .then((data) => {
          let output = {};
          output.products = JSON.parse(data[0]);
          output.reviews = JSON.parse(data[1]);
          output.users = JSON.parse(data[2]);
          return output;
          //data.forEach((datum) => JSON.parse(datum));
        })
        // .then((data) => console.log(data));yuya
        .then((data) => produceResult(data))
    );
  }

  async buildReviewsAsyncAwait() {
    // FIXME
    async function returnTable() {
      let allData = await Promise.all([
        readFile("./data/products.json"),
        readFile("./data/reviews.json"),
        readFile("./data/users.json"),
      ])
        .then((data) => {
          let output = {};
          output.products = JSON.parse(data[0]);
          output.reviews = JSON.parse(data[1]);
          output.users = JSON.parse(data[2]);
          return output;
        })
        .then((data) => produceResult(data));
      return allData;
    }
    return returnTable();
  }
}

module.exports = ReviewBuilder;
