import { Injectable } from '@angular/core';
import { StorageService } from './localstorage';

interface List {
    id: string
    title: string
    type: "created" | "todo" | "pending" | "done" | "expired"
}

@Injectable({
    providedIn: 'root'
})
export class list {

    constructor(private storageService: StorageService) { }

    readLists() {
        try {
            const data = this.storageService.getItem("lists");
            return JSON.parse(data ?? "[]"); // Convert JSON string to object
        } catch (error) {
            console.error("Error reading lists:", error);
            return []; // Return an empty list in case of error
        }
    }

    async writeLists(lists: List[]) {
        try {
            await this.storageService.setItem("lists", JSON.stringify(lists));
            return true;
        } catch (error) {
            console.error("Error writing lists:", error);
            return false;
        }
    }

    async getLists() {
        const lists: List[] = await this.readLists()
        return Promise.resolve(lists)
    }

    async addLists(list: List) {
        const lists: List[] = await this.readLists()
        if (await this.writeLists([...lists, list])) {
            return "List Added"
        }
        return Promise.resolve("Unable to addUser")
    }

    async updateList(list: List) {
        const lists: List[] = await this.readLists()
        const values = lists.map((valueList: List) => (
            valueList.id === list.id ? list : valueList
        ));
        if (await this.writeLists(values)) {
            return "List Updated"
        }
        return Promise.resolve("Unable to Updated")
    }

    async DeleteList(ListId: string) {
        const lists: List[] = await this.readLists()
        const values: List[] = lists.filter(({ id }: List) => (
            id !== ListId
        ));
        if (await this.writeLists(values)) {
            return "List Deleted"
        }
        return Promise.resolve("Unable to DeletedList")
    }
}
