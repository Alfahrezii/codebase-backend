
const ObjectId = require('mongodb').ObjectId;

class Query {

  constructor(db) {
    this.db = db;
    this.db.setCollection('user');
  }

  async findOneUser(parameter) {
    return this.db.findOne(parameter);
  }

  async findById(id) {
    const parameter = {
      _id: ObjectId(id)
    };
    return this.db.findOne(parameter);
  }

}

module.exports = Query;
