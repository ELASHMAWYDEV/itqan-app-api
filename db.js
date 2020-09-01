require("dotenv").config();
const mongodb = require("mongodb").MongoClient;

const url = process.env.MONGODB || "mongodb://localhost:27017/";
const dbName = process.env.DB_NAME || "itqan";

class Database {
  constructor() {
    try {

      mongodb.connect(url, (err, client) => {
        if (err) {
          console.log("Connection to Database Server Failed !");
          this.db = null;
          console.log(err);
        } else {
          this.db = client.db(dbName);
          this.client = client;
        }
      });
    } catch (e) {
      console.log(e.message);
    }
  }

  close = () => {
    try {
      this.client.close();
    } catch (e) {
      console.log(e.message);
    }
  };

  collection = (collectionName) => {
    try {
      return this.db.collection(collectionName);
    } catch (e) {
      console.log(e.message);
    }
  };

  
}

module.exports = new Database();
