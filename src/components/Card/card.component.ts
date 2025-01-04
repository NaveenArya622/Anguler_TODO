import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { injectMutation, injectQuery, injectQueryClient, QueriesObserver } from "@tanstack/angular-query-experimental";
import { list } from "../../utils/localstorage/list";
import { Cards } from "../../utils/localstorage/card";

interface CardType {
    id: string
    title: string
    listId: string
    description?: string
}

interface ListType {
    id: string
    title: string
    type: "created" | "todo" | "pending" | "done" | "expired"
}

@Component({
    selector: 'app-input',
    templateUrl: './card.component.html',
    styleUrl: './card.component.scss',
    imports: [FormsModule, ReactiveFormsModule]
})
export class CardComponents {
    constructor(
        private Cards: Cards,
        private List: list
    ) { }
    queryClient = injectQueryClient()
    @Output() deleteCardEvent = new EventEmitter<string>();
    @Input() title = "";
    @Input() listId = "";
    @Input() id = "";
    @Input() description = "";

    listQuery = injectQuery(() => ({
        queryKey: ['listData'],
        queryFn: async () => {
            try {
                const lists = await this.List.getLists();
                return lists ?? []
            } catch (error) {
                return []
            }
        },
        select: (lists: ListType[]) => lists,
    }))

    isEditingCard = false;
    cardForm = new FormGroup({
        title: new FormControl(this.title, Validators.required),
        description: new FormControl(this.description, Validators.required),
        listId: new FormControl(this.listId, Validators.required),
    });

    deleteCardMutation = injectMutation(() => ({
        mutationFn: async (id: string) => {
            try {
                const messageToUser = await this.Cards.DeleteCard(id)
                return new Response(
                    JSON.stringify({
                        status: 200,
                        message: "Card Deleted successfully",
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
                        message: "Card not Deleted.",
                        body: { error: error },
                    }),
                    {
                        status: 500,
                        headers: { "Content-Type": "application/json" },
                    }
                );
            }
        },
        onSuccess: (_, listId) => {
            this.queryClient.invalidateQueries({ queryKey: [listId] })
            this.queryClient.invalidateQueries({ queryKey: [this.listId] })
            this.queryClient.invalidateQueries({ queryKey: ["All"] })
        },
        onError: (error: Error) => {
            console.error(error?.message)
        },
    }))


    deleteCard(event: any, id: string) {
        event.preventDefault();
        event.stopPropagation();
        this.deleteCardMutation.mutate(id);
    }
    async setIsEditingCard(value: boolean) {
        this.isEditingCard = value;
        this.cardForm.setValue({ title: this.title, description: this.description, listId: this.listId })
    }
    handleCancel() {
        this.isEditingCard = false;
        this.cardForm.setValue({ title: this.title, description: this.description, listId: this.listId })
    }

    updateCardMutation = injectMutation(() => ({
        mutationFn: async (card: CardType) => {
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
        onSuccess: (_, card) => {
            this.queryClient.invalidateQueries({ queryKey: [this.listId] })
            this.queryClient.invalidateQueries({ queryKey: ["All"] })
            this.queryClient.invalidateQueries({ queryKey: [card.listId] })
        },
        onError: (error: Error) => {
            console.error(error?.message)
        },
    }))

    async handleSave() {
        const newCard: CardType = {
            id: this.id,
            title: String(this.cardForm.getRawValue().title),
            listId: String(this.cardForm.getRawValue().listId),
            description: String(this.cardForm.getRawValue().description)
        };
        this.isEditingCard = false
        this.updateCardMutation.mutate(newCard);
    }
}