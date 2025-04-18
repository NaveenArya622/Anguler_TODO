import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ListComponents } from '../List/list.component';
import { InputListComponents } from '../InputList/input.list.component';
import { injectQuery } from '@tanstack/angular-query-experimental'
import { list } from '../../utils/localstorage/list';

interface ListType {
  id: string
  title: string
  type: "created" | "todo" | "pending" | "done" | "expired"
}


interface currentCardIdsType {
  cardId: string
  listId: string
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ListComponents, InputListComponents]
})
export class HomeComponents {
  constructor(private List: list) { }
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
}