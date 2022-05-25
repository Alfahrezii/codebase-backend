
class Command {

  constructor(db) {
    this.db = db;
    this.db.setCollection('user');
  }

  async insertOneUser(document){
    return this.db.insertOne(document);
  }

  async upsertOneUser(params, document){
    return this.db.upsertOne(params, document);
  }

}

module.exports = Command;
