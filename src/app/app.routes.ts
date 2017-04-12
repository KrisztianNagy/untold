import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import { GameComponent } from './game/game.component';
import { BoardComponent } from './game/board/board.component';
import { MyRealmsComponent } from './my-realms/my-realms.component';
import { SaveRealmComponent } from './save-realm/save-realm.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { RealmWelcomeComponent } from './game/realm-welcome/realm-welcome.component';
import { GenesisModulesComponent } from './game/genesis-modules/genesis-modules.component';
import { GenesisRuleTablesComponent } from './game/genesis-rule-tables/genesis-rule-tables.component';
import { GenesisDefinitionsComponent } from './game/genesis-definitions/genesis-definitions.component';
import { GenesisTemplatesComponent } from './game/genesis-templates/genesis-templates.component';
import { GenesisEntitiesComponent } from './game/genesis-entities/genesis-entities.component';
import { RealmImagesComponent } from './game/realm-images/realm-images.component';
import { MapsComponent } from './game/maps/maps.component';
import { SaveMapComponent } from './game/save-map/save-map.component';
import { CanActivateSelectedRealmGuard } from './shared/guards/can-activate-selected-realm.guard';
import { CanActivateSelectedRealmOwnerGuard } from './shared/guards/can-activate-selected-realm-owner.guard';
import { CanActivateAuthenticationGuard } from './shared/guards/can-activate-authentication.guard';

export const routes: Routes = [
    {path: 'realms', component: MyRealmsComponent, canActivate: [CanActivateAuthenticationGuard]},
    {path: 'notifications', component: NotificationsComponent},
    {path: 'save', component: SaveRealmComponent},
    {path: 'save/:id', component: SaveRealmComponent},
    {path: 'game', component: GameComponent, children: [
        {path: '', component: RealmWelcomeComponent},
        {path: 'modules', component: GenesisModulesComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'ruletables', component: GenesisRuleTablesComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'definitions', component: GenesisDefinitionsComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'templates', component: GenesisTemplatesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'entities', component: GenesisEntitiesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'images', component: RealmImagesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'maps', component: MapsComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'savemap', component: SaveMapComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'savemap/:id', component: SaveMapComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'board', component: BoardComponent}
    ]},
    { path: '**', redirectTo: 'realms' }
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
