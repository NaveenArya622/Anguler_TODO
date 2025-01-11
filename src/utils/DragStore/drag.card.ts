import { Injectable } from "@angular/core";

interface Card {
    id: string
    title: string
    listId: string
    description?: string
}

@Injectable({
    providedIn: 'root'
})
export class DragCard {
    constructor() { }
    public dragCard: Card | undefined;

    setDragCard(cardValue?: Card) {
        this.dragCard = cardValue
    }

    getDragCard() {
        return this.dragCard
    }
}