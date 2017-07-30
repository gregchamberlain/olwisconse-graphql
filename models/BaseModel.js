class BaseModel {

  get createdAt() {
    return this._createdAt.toISOString();
  }

  set createdAt(value) {
    this._createdAt = value;
  }

  get updatedAt() {
    return this._updatedAt.toISOString();
  }

  set updatedAt(value) {
    this._updatedAt = value;
  }
}

export default BaseModel;