import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { injectMutation, injectQuery, injectQueryClient } from "@tanstack/angular-query-experimental";
import { Cards } from "../../utils/localstorage/card";
import { CardComponents } from "../Card/card.component";
import { list } from "../../utils/localstorage/list";
import { DragCard } from "../../utils/DragStore/drag.card";

interface CardType {
    id: string
    title: string
    listId: string
    description?: string
}

interface currentCardIdsType {
    cardId: string
    listId: string
}

@Component({
    selector: 'app-user',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [CardComponents, FormsModule]
})
export class ListComponents {
    constructor(
        private DragCard: DragCard,
        private Cards: Cards,
        private List: list
    ) { }
    queryClient = injectQueryClient()
    @Input() title = "";
    @Input() listId = "";
    @Input() listType = "";
    newTitle = "";
    isAddingCard = false;
    cardsQuery = injectQuery(() => ({
        queryKey: [this.listId === "" ? "All" : this.listId],
        queryFn: async () => {
            try {
                const cards = await this.Cards.getCards(this.listId);
                return cards ?? []
            } catch (error) {
                return []
            }
        },
        select: (cards: CardType[]) => cards,
    }))
    allCardsQuery = injectQuery(() => ({
        queryKey: ["All"],
        queryFn: async () => {
            try {
                const lists = await this.Cards.getCards("");
                return lists ?? []
            } catch (error) {
                return []
            }
        },
        select: (lists: CardType[]) => lists,
    }))
    setIsAddingCard(value: boolean) {
        this.isAddingCard = value;
        this.newTitle = "";
    }

    addCardMutation = injectMutation(() => ({
        mutationFn: async (card: CardType) => {
            try {
                const messageToUser = await this.Cards.addCards(card)
                return new Response(
                    JSON.stringify({
                        status: 200,
                        message: "Card Added successfully",
                        messageToUser
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    }
                )
            } catch (error) {
                return new Response(
                    JSON.stringify({
                        status: 500,
                        message: "Card not added.",
                        body: { error: error },
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        },
        onSuccess: (_, card) => {
            this.isAddingCard = false;
            this.allCardsQuery.refetch();
            this.queryClient.invalidateQueries({ queryKey: [card.listId] })
        },
        onError: (error: Error) => {
            this.isAddingCard = false
            console.error(error?.message)
        },
    }))



    deleteListMutation = injectMutation(() => ({
        mutationFn: async (id: string) => {
            try {
                const messageToUser = await this.List.DeleteList(id)
                return new Response(
                    JSON.stringify({
                        status: 200,
                        message: "List Deleted successfully",
                        messageToUser
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    }
                )
            } catch (error) {
                return new Response(
                    JSON.stringify({
                        status: 500,
                        message: "List not Deleted.",
                        body: { error: error },
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        },
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ["listData"] })
        },
        onError: (error: Error) => {
            console.error(error?.message)
        },
    }))


    deleteList() {
        this.deleteListMutation.mutate(this.listId);
    }


    handleAddCard() {
        const card: CardType = {
            id: Date.now().toString(),
            title: this.newTitle,
            listId: this.listId,
            description: "",
        }
        this.addCardMutation.mutate(card)
    }

    updateCardMutation = injectMutation(() => ({
        mutationFn: async ({ card }: { card: CardType, prevListId: string }) => {
            try {
                const messageToUser = await this.Cards.updateCard(card)
                return new Response(
                    JSON.stringify({
                        status: 200,
                        message: "Card updated successfully",
                        messageToUser,
                        listId: card.listId
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" }
                    }
                )
            } catch (error) {
                return new Response(
                    JSON.stringify({
                        status: 500,
                        message: "Card not updated.",
                        body: { error: error },
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        },
        onSuccess: (_, { prevListId }) => {
            this.queryClient.invalidateQueries({ queryKey: [this.listId] })
            this.queryClient.invalidateQueries({ queryKey: ["All"] })
            this.queryClient.invalidateQueries({ queryKey: [prevListId] })
        },
        onError: (error: Error) => {
            console.error(error?.message)
        },
    }))
    async enter() {
        const newCard = this.DragCard.getDragCard();
        if (this.listId !== "" && newCard && this.listId !== newCard?.listId) {
            this.updateCardMutation.mutate({ card: { ...newCard, listId: this.listId, }, prevListId: newCard.listId })
        }
    }
}