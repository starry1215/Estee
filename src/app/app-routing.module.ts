import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './other/login.component';
import { EsteeEntryComponent } from './calendar/estee.component';

//The order of the routes matters.
//The router uses a first-mathc wins strategy when matching routes, so more specific routes should be placed above less specific routes.
//Generally, routes with a static path are listed first, followed by an empty path route, that matches the default route.
//The wildcard route comes last because it matches every URL and should be selected only if no other routes are matched first.
const routes: Routes = [
    {
        path: 'calendar',
        component: EsteeEntryComponent,
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'estee',
        component: EsteeEntryComponent,
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }