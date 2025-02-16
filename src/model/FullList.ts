import ListItem from "./ListItem";
import { database } from "../firebaseConfig";
import { ref, set, onValue } from "firebase/database";
import ListTemplate from "../templates/ListTemplate"; // Import ListTemplate

const listInDB = ref(database, "ListItems");

export default class FullList {
  static instance: FullList = new FullList();
  private _list: ListItem[] = [];

  get list(): ListItem[] {
    return this._list;
  }

  // Subscribe to realtime updates from the database
  load(): void {
    onValue(listInDB, (snapshot) => {
      const itemsData = snapshot.val();
      if (itemsData) {
        // Convert the stored array (or object) into an array of ListItem objects
        this._list = Object.keys(itemsData).map((key) => {
          const { _id, _item, _checked, _image } = itemsData[key];
          return new ListItem(_id, _item, _checked, _image);
        });
      } else {
        this._list = [];
      }
      // Trigger UI update after receiving realtime data
      ListTemplate.instance.render(FullList.instance);
    });
  }

  // Use set() to write the entire list to the database
  save(): void {
    set(listInDB, this._list);
  }

  clearList(): void {
    this._list = [];
    this.save();
  }

  addItem(itemObj: ListItem): void {
    this._list.push(itemObj);
    this.save();
  }

  removeItem(id: string): void {
    const index = this._list.findIndex((item) => item.id === id);
    if (index !== -1) {
      this._list.splice(index, 1);
      this.save();
    }
  }

  removeCheckedItems(): void {
    this._list = this._list.filter((item) => !item.checked);
    this.save();
  }
}
