require("dotenv").config();
const mongodb = require("mongodb").MongoClient;

const url = process.env.MONGODB || "mongodb://localhost:27017/";
const dbName = process.env.DB_NAME || "itqan";

class Database {
  constructor() {
    mongodb.connect(url, (err, client) => {
      if (err) {
        console.log("Connection to Database Server Failed !");
        this.db = null;
        return res.json(err);
      } else {
        this.db = client.db(dbName);
        this.client = client;
      }
    });
  }

  closeConnection = async () => {
    try {
      await this.client.close();
      console.log("connection closed");
    } catch (e) {
      console.log(e.message);
    }
  };

  collection = (collectionName) => {
    try {
      return this.db.collection(collectionName, this.closeConnection);
    } catch (e) {
      console.log(e.message);
    }
  };

  
}

module.exports = new Database();
