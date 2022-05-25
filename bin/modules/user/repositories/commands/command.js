
class Command {

  constructor(db) {
    this.db = db;
    this.db.setCollection('user');
  }

  async insertOneUser(document){
    return this.db.insertOne(document);
  }
}

module.exports = Command;
