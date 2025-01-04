import { Component, EventEmitter, Input, Output } from "@angular/core"
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms"
import { list } from "../../utils/localstorage/list";
import { injectMutation, injectQueryClient } from "@tanstack/angular-query-experimental";

interface listType {
    id: string,
    title: string,
    type: "created" | "todo" | "pending" | "done" | "expired"
}
@Component({
    selector: 'app-input',
    templateUrl: './input.list.component.html',
    styleUrl: './input.list.component.scss',
    imports: [FormsModule, ReactiveFormsModule]
})
export class InputListComponents {
    constructor(private List: list) { }
    queryClient = injectQueryClient()
    isAddingList = false;
    listForm = new FormGroup({
        title: new FormControl('', Validators.required),
        type: new FormControl('created', Validators.required),
    });
    setIsAddingList(value: boolean) {
        this.isAddingList = value;
        this.listForm.setValue({ title: "", type: "created" })
    }
    handleCancel() {
        this.isAddingList = false
    }
    addListMutation = injectMutation(() => ({
        mutationFn: async (list: listType) => {
            try {
                const messageToUser = await this.List.addLists(list)
                return new Response(
                    JSON.stringify({
                        status: 200,
                        message: "List Added successfully",
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
                        message: "List not added.",
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
            this.queryClient.invalidateQueries({ queryKey: ["listData"] });
        },
        onError: (error: Error) => {
            console.error(error?.message)
        },
    }))
    async handleAddList() {
        const newList: listType = {
            id: Date.now().toString(),
            title: String(this.listForm.getRawValue().title),
            type: String(this.listForm.getRawValue().type) as "created" | "todo" | "pending" | "done" | "expired"
        };
        this.isAddingList = false
        this.listForm.setValue({ title: "", type: "created" })
        this.addListMutation.mutate(newList);
    }
}