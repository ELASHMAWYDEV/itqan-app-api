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

  closeConnection = () => {
    this.client.close();
  };

  collection = (collectionName) => {
    return this.db.collection(collectionName, () => this.closeConnection);
  };


  nextIndex = (collectionName) => {

    //get the last index
    this.db
      .collection("counter", () => this.closeConnection)
      .findOne({ _id: collectionName }, (err, result) => {
        if (err) throw err;
        this.index = result.value;
      });
    
    //update the index by adding +1
    this.index += 1;
    this.db
      .collection("counter", () => this.closeConnection)
      .updateOne({ _id: collectionName }, {$set: {value: this.index}}, (err, result) => {
        if (err) throw err;
        return result.value;
      });
    
    return this.index;
  };
}

module.exports = new Database();
