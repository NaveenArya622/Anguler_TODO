import { Injectable } from '@angular/core';
import { StorageService } from './localstorage';

interface Card {
    id: string
    title: string
    listId: string
    description?: string
}

@Injectable({
    providedIn: 'root'
})
export class Cards {
    constructor(private storageService: StorageService) { }

    readCards() {
        try {
            const data = this.storageService.getItem("cards");
            return JSON.parse(data ?? "[]"); // Convert JSON string to object
        } catch (error) {
            console.error("Error reading Cards:", error);
            return []; // Return an empty list in case of error
        }
    }

    async writeCards(lists: Card[]) {
        try {
            await this.storageService.setItem("cards", JSON.stringify(lists));
            return true;
        } catch (error) {
            console.error("Error writing Cards:", error);
            return false;
        }
    }

    async getCards(listId: string) {
        const cards: Card[] = await this.readCards();
        if (listId === "") {
            return cards
        }
        const value = cards.filter((card) => card.listId === listId)
        return Promise.resolve(value)
    }

    async addCards(card: Card) {
        const cards: Card[] = await this.readCards()
        if (await this.writeCards([...cards, card])) {
            return "Card Added"
        }
        return Promise.resolve("Unable to addUser")
    }

    async updateCard(card: Card) {
        const cards: Card[] = await this.readCards()
        const values = cards.map((valueCard: Card) => (
            valueCard.id === card.id ? card : valueCard
        ));
        if (await this.writeCards(values)) {
            return "Card Updated"
        }
        return Promise.resolve("Unable to Updated")
    }

    async DeleteCard(CardId: string) {
        const cards: Card[] = await this.readCards()
        const values: Card[] = cards.filter(({ id }: Card) => (
            id !== CardId
        ));
        if (await this.writeCards(values)) {
            return "Card Deleted"
        }
        return Promise.resolve("Unable to DeletedList")
    }
}
