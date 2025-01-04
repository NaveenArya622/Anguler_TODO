import { Routes } from '@angular/router';
import { HomeComponents } from '../components/Home/home.component'

export const routes: Routes = [
    {path: "Home", component: HomeComponents},
    {path: "", redirectTo: "Home", pathMatch: "full"}
];
