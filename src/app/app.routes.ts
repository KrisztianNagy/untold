import {Routes, RouterModule, RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle} from '@angular/router';
import {ModuleWithProviders, Injectable} from '@angular/core';
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
import { GenesisSheetsComponent } from './game/genesis-sheets/genesis-sheets.component';
import { EditSheetComponent } from './game/genesis-sheets/edit-sheet/edit-sheet.component';
import { SheetCreatorComponent } from './game/genesis-sheets/sheet-creator/sheet-creator.component';
import { EntityWrapperComponent } from './entity-wrapper/entity-wrapper.component';
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
    {path: 'game', component: GameComponent, canActivate: [CanActivateSelectedRealmGuard], children: [
        {path: '', component: RealmWelcomeComponent},
        {path: 'modules', component: GenesisModulesComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'ruletables', component: GenesisRuleTablesComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'definitions', component: GenesisDefinitionsComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'sheets', component: GenesisSheetsComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'sheet/:id', component: SheetCreatorComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'templates', component: GenesisTemplatesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'entities', component: GenesisEntitiesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'entity/:id', component: EntityWrapperComponent, canActivate: [ CanActivateSelectedRealmGuard]},
        {path: 'images', component: RealmImagesComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'maps', component: MapsComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'savemap', component: SaveMapComponent, canActivate: [CanActivateSelectedRealmOwnerGuard]},
        {path: 'savemap/:id', component: SaveMapComponent, canActivate: [ CanActivateSelectedRealmOwnerGuard]},
        {path: 'board', component: BoardComponent}
    ]},
    { path: '**', redirectTo: 'realms' }
];

export const RouteVariables = {
    hasRootError: false
};

@Injectable()
export class PreventErrorRouteReuseStrategy implements RouteReuseStrategy {

    shouldDetach(route: ActivatedRouteSnapshot): boolean { return false; }
    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {}
    shouldAttach(route: ActivatedRouteSnapshot): boolean { return false; }
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null { return null; }
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
      return false;
    }
  }

  export function MyRouterErrorHandler(error: any) {
    console.log('RouterErrorHandler: ' + error);
    RouteVariables.hasRootError = true;
    throw error;
  }

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes, {
    errorHandler: MyRouterErrorHandler
});




