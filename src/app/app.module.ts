import {NgModule, ErrorHandler} from '@angular/core';
import {RouteReuseStrategy} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {AppRoutes , PreventErrorRouteReuseStrategy} from './app.routes';
import {StoreModule} from '@ngrx/store';
import {enableProdMode} from '@angular/core';
import 'rxjs/add/operator/toPromise';

// PrimeNG components
import {AccordionModule} from 'primeng/primeng';
import {AutoCompleteModule} from 'primeng/primeng';
import {BreadcrumbModule} from 'primeng/primeng';
import {ButtonModule} from 'primeng/primeng';
import {CalendarModule} from 'primeng/primeng';
import {CarouselModule} from 'primeng/primeng';
import {ChartModule} from 'primeng/primeng';
import {CheckboxModule} from 'primeng/primeng';
import {ChipsModule} from 'primeng/primeng';
import {CodeHighlighterModule} from 'primeng/primeng';
import {ConfirmDialogModule} from 'primeng/primeng';
import {SharedModule} from 'primeng/primeng';
import {ContextMenuModule} from 'primeng/primeng';
import {DataGridModule} from 'primeng/primeng';
import {DataListModule} from 'primeng/primeng';
import {DataScrollerModule} from 'primeng/primeng';
import {DataTableModule} from 'primeng/primeng';
import {DialogModule} from 'primeng/primeng';
import {DragDropModule} from 'primeng/primeng';
import {DropdownModule} from 'primeng/primeng';
import {EditorModule} from 'primeng/primeng';
import {FieldsetModule} from 'primeng/primeng';
import {FileUploadModule} from 'primeng/primeng';
import {GalleriaModule} from 'primeng/primeng';
import {GMapModule} from 'primeng/primeng';
import {GrowlModule} from 'primeng/primeng';
import {InputMaskModule} from 'primeng/primeng';
import {InputSwitchModule} from 'primeng/primeng';
import {InputTextModule} from 'primeng/primeng';
import {InputTextareaModule} from 'primeng/primeng';
import {LightboxModule} from 'primeng/primeng';
import {ListboxModule} from 'primeng/primeng';
import {MegaMenuModule} from 'primeng/primeng';
import {MenuModule} from 'primeng/primeng';
import {MenubarModule} from 'primeng/primeng';
import {MessagesModule} from 'primeng/primeng';
import {MultiSelectModule} from 'primeng/primeng';
import {OrderListModule} from 'primeng/primeng';
import {OverlayPanelModule} from 'primeng/primeng';
import {PaginatorModule} from 'primeng/primeng';
import {PanelModule} from 'primeng/primeng';
import {PanelMenuModule} from 'primeng/primeng';
import {PasswordModule} from 'primeng/primeng';
import {PickListModule} from 'primeng/primeng';
import {ProgressBarModule} from 'primeng/primeng';
import {RadioButtonModule} from 'primeng/primeng';
import {RatingModule} from 'primeng/primeng';
import {ScheduleModule} from 'primeng/primeng';
import {SelectButtonModule} from 'primeng/primeng';
import {SlideMenuModule} from 'primeng/primeng';
import {SliderModule} from 'primeng/primeng';
import {SpinnerModule} from 'primeng/primeng';
import {SplitButtonModule} from 'primeng/primeng';
import {StepsModule} from 'primeng/primeng';
import {TabMenuModule} from 'primeng/primeng';
import {TabViewModule} from 'primeng/primeng';
import {TerminalModule} from 'primeng/primeng';
import {TieredMenuModule} from 'primeng/primeng';
import {ToggleButtonModule} from 'primeng/primeng';
import {ToolbarModule} from 'primeng/primeng';
import {TooltipModule} from 'primeng/primeng';
import {TreeModule} from 'primeng/primeng';
import {TreeTableModule} from 'primeng/primeng';
import {OrganizationChartModule} from 'primeng/primeng';
import {InplaceModule} from 'primeng/primeng';
import {SidebarModule} from 'primeng/components/sidebar/sidebar';
import {AceEditorModule} from 'ng2-ace-editor';

// Barcelona layout
import {AppComponent} from './app.component';
import {AppMenuComponent,AppSubMenu} from './app.menu.component';
import {AppSideBarComponent} from './app.sidebar.component';
import {AppSidebarTabContent} from './app.sidebartabcontent.component';
import {AppTopBar} from './app.topbar.component';
import {AppFooter} from './app.footer.component';

// Untold App
import { BoardComponent } from './game/board/board.component';
import { CombinedReducers } from './store/reducers';
import { LayerSelectorComponent } from './game/board/layer-selector/layer-selector.component';
import { StatisticsComponent } from './game/board/statistics/statistics.component';
import { SelectedTokenComponent } from './game/board/toolbar/selected-token/selected-token.component';
import { EntityListComponent } from './game//board/entity-list/entity-list.component';
import { WallDrawingComponent } from './game/board/wall-drawing/wall-drawing.component';
import { WebApiService } from './shared/services/rest/web-api.service';
import { RealmDataService } from './shared/services/rest/realm-data.service';
import { MapDataService } from './shared/services/rest/map-data.service';
import { NotificationDataService } from './shared/services/rest/notification-data.service';
import { UserDataService } from './shared/services/rest/user-data.service';
import { FileDataService } from './shared/services/rest/file-data.service';
import { StorageDataService } from './shared/services/rest/storage-data.service';
import { GenesisDataService } from './shared/services/rest/genesis-data.service';
import { GameService } from './store/services/game.service';
import { TemplateConfigurationService } from './store/services/template-configuration.service';
import { SignalRService } from './shared/services/signal-r.service';
import { RealmHubSenderService } from './shared/services/realm-hub-sender.service';
import { RealmHubListenerService } from './shared/services/realm-hub-listener.service';
import { DomService } from './shared/services/dom.service';
import { NotificationTemplateService } from './shared/services/notification-template.service';
import { TableStorageService } from './shared/services/table-storage.service';
import { TreeNodeService } from './shared/services/tree-node.service';
import { AuthService } from './shared/services/auth.service';
import { GridService } from './store/services/grid.service';
import { WallService } from './store/services/wall.service';
import { VisibleAreaService } from './store/services/visible-area.service';
import { InteractionService } from './store/services/interaction.service';
import { TokenService } from './store/services/token.service';
import { RealmTableService } from './store/services/realm-table.service';
import { RealmDefinitionService } from './store/services/realm-definition.service';
import { EntityService } from './store/services/entity.service';
import { SheetService } from './store/services/sheet.service';
import { CalculatedExpressionService } from './shared/services/expressions/calculated-expression.service';
import { ExpressionEvaluatorService } from './shared/services/expressions/expression-evaluator.service';
import { ExpressionOperatorService } from './shared/services/expressions/expression-operator.service';
import { ExpressionFunctionService } from './shared/services/expressions/expression-function.service';
import { ExpressionTableCacheService } from './shared/services/expressions/expression-table-cache.service';
import { EntityEnhancerService } from './shared/services/expressions/entity-enhancer.service';
import { SheetEntityService } from './shared/services/expressions/sheet-entity.service';
import { DefinitionEnhancerService } from './shared/services/expressions/definition-enhancer.service';
import { SheetEnhancerService } from './shared/services/expressions/sheet-enhancer.service';
import { CanActivateSelectedRealmGuard } from './shared/guards/can-activate-selected-realm.guard';
import { CanActivateSelectedRealmOwnerGuard } from './shared/guards/can-activate-selected-realm-owner.guard';
import { CanActivateAuthenticationGuard } from './shared/guards/can-activate-authentication.guard';
import { MyRealmsComponent } from './my-realms/my-realms.component';
import { SaveRealmComponent } from './save-realm/save-realm.component';
import { RealmWelcomeComponent } from './game/realm-welcome/realm-welcome.component';
import { GenesisModulesComponent } from './game/genesis-modules/genesis-modules.component';
import { GenesisDefinitionsComponent } from './game/genesis-definitions/genesis-definitions.component';
import { GenesisTemplatesComponent } from './game/genesis-templates/genesis-templates.component';
import { GenesisEntitiesComponent } from './game/genesis-entities/genesis-entities.component';
import { MapsComponent } from './game/maps/maps.component';
import { SaveMapComponent } from './game/save-map/save-map.component';
import { GameComponent } from './game/game.component';
import { UntoldErrorHandler } from './shared/error/untold-error-handler';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { TopBarNotificationComponent } from './top-bar/top-bar-notification/top-bar-notification.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { GrowlService } from './shared/services/growl.service';
import { CsvFileService } from './shared/services/csv-file.service';
import { WebWorkerService } from './shared/services/web-worker.service';
import { GameWorkflowService } from './shared/services/game-flow/game-workflow.service';
import { GameWorkflowRealmService } from './shared/services/game-flow/game-workflow-realm.service';
import { GameWorkflowMapService } from './shared/services/game-flow/game-workflow-map.service';
import { GameWorkflowEntityService } from './shared/services/game-flow/game-workflow-entity.service';
import { GameWorkflowSheetService } from './shared/services/game-flow/game-workflow-sheet.service';
import { ToolbarComponent } from './game/board/toolbar/toolbar.component';
import { RealmImagesComponent } from './game/realm-images/realm-images.component';
import { LoadQueueService } from './shared/services/load-queue.service';
import { EditTokenComponent } from './game/board/toolbar/edit-token/edit-token.component';
import { ConnectionOverlayComponent } from './connection-overlay/connection-overlay.component';
import { FiltersDefinitionMembersPipe } from './shared/pipes/definition-member.pipe';
import { FiltersRuleTableColumnsPipe } from './shared/pipes/ruletable-column.pipe';
import { MenuVisibilityPipe } from './shared/pipes/menu-visibility.pipe';
import { GenesisRuleTablesComponent } from './game/genesis-rule-tables/genesis-rule-tables.component';
import { RuleTableImportWizardComponent } from './game/genesis-rule-tables/rule-table-import-wizard/rule-table-import-wizard.component';
import { EditDefinitionComponent } from './game/genesis-definitions/edit-definition/edit-definition.component';
import { EditRuleComponent } from './game/genesis-definitions/genesis-definitions-chart/edit-rule/edit-rule.component';
import { ShowRulesComponent } from './game/genesis-definitions/genesis-definitions-chart/show-rules/show-rules.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { FooterComponent } from './footer/footer.component';
import { EntityEditorComponent } from './game/genesis-entities/entity-editor/entity-editor.component';
// tslint:disable-next-line:max-line-length
import { ExpressionBuilderComponent } from './game/genesis-definitions/genesis-definitions-chart/edit-rule/expression-builder/expression-builder.component';
import { HomeSideBarComponent } from './side-bar/home-side-bar/home-side-bar.component';
import { TemplateSideBarComponent } from './side-bar/template-side-bar/template-side-bar.component';
import { DefinitionSideBarComponent } from './side-bar/definition-side-bar/definition-side-bar.component';
import { ModuleSideBarComponent } from './side-bar/module-side-bar/module-side-bar.component';
import { EntitySideBarComponent } from './side-bar/entity-side-bar/entity-side-bar.component';
import { ImageSideBarComponent } from './side-bar/image-side-bar/image-side-bar.component';
import { MapSideBarComponent } from './side-bar/map-side-bar/map-side-bar.component';
import { RuleSideBarComponent } from './side-bar/rule-side-bar/rule-side-bar.component';
import { BoardSideBarComponent } from './side-bar/board-side-bar/board-side-bar.component';
import { EntityWrapperComponent } from './entity-wrapper/entity-wrapper.component';
import { SheetSideBarComponent } from './side-bar/sheet-side-bar/sheet-side-bar.component';
import { GenesisSheetsComponent } from './game/genesis-sheets/genesis-sheets.component';
import { EditSheetComponent } from './game/genesis-sheets/edit-sheet/edit-sheet.component';
import { SheetViewerComponent } from './sheet-viewer/sheet-viewer.component';
// tslint:disable-next-line:max-line-length
import { DefinitionListConfigComponent } from './game/genesis-definitions/genesis-definitions-chart/definition-list-config/definition-list-config.component';
import { DefinitionChoiceConfigComponent } from './game/genesis-definitions/genesis-definitions-chart/definition-choice-config/definition-choice-config.component';
import { GenesisDefinitionsChartComponent } from './game/genesis-definitions/genesis-definitions-chart/genesis-definitions-chart.component';
// tslint:disable-next-line:max-line-length
import { GenesisDefinitionsAddFormComponent } from './game/genesis-definitions/genesis-definitions-chart/genesis-definitions-add-form/genesis-definitions-add-form.component';
import { ShowRuleTableComponent } from './show-rule-table/show-rule-table.component';
import { EditTableColumnComponent } from './show-rule-table/edit-table-column/edit-table-column.component';
import { PrimeDragulaDirective } from './shared/directives/prime-dragula.directive';
import { DragulaService } from 'ng2-dragula';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutes,
        HttpModule,
        BrowserAnimationsModule,
        AccordionModule,
        AutoCompleteModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CarouselModule,
        ChartModule,
        CheckboxModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        SharedModule,
        ContextMenuModule,
        DataGridModule,
        DataListModule,
        DataScrollerModule,
        DataTableModule,
        DialogModule,
        DragDropModule,
        DropdownModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        GalleriaModule,
        GMapModule,
        GrowlModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        ScheduleModule,
        SelectButtonModule,
        SlideMenuModule,
        SliderModule,
        SpinnerModule,
        SplitButtonModule,
        StepsModule,
        TabMenuModule,
        TabViewModule,
        TerminalModule,
        TieredMenuModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        OrganizationChartModule,
        InplaceModule,
        SidebarModule,
        AceEditorModule,
        StoreModule.forRoot(CombinedReducers)
    ],
    declarations: [
        AppComponent,
        AppMenuComponent,
        AppSubMenu,
        AppSideBarComponent,
        AppSidebarTabContent,
        AppTopBar,
        AppFooter,
        BoardComponent,
        LayerSelectorComponent,
        StatisticsComponent,
        SelectedTokenComponent,
        EntityListComponent,
        WallDrawingComponent,
        MyRealmsComponent,
        SaveRealmComponent,
        RealmWelcomeComponent,
        GenesisModulesComponent,
        GenesisDefinitionsComponent,
        GenesisTemplatesComponent,
        GenesisEntitiesComponent,
        MapsComponent,
        SaveMapComponent,
        GameComponent,
        ErrorDialogComponent,
        TopBarNotificationComponent,
        NotificationsComponent,
        ToolbarComponent,
        RealmImagesComponent,
        EditTokenComponent,
        ConnectionOverlayComponent,
        FiltersDefinitionMembersPipe,
        FiltersRuleTableColumnsPipe,
        MenuVisibilityPipe,
        GenesisRuleTablesComponent,
        RuleTableImportWizardComponent,
        EditDefinitionComponent,
        EditRuleComponent,
        ShowRulesComponent,
        TopBarComponent,
        FooterComponent,
        EntityEditorComponent,
        ExpressionBuilderComponent,
        HomeSideBarComponent,
        TemplateSideBarComponent,
        DefinitionSideBarComponent,
        ModuleSideBarComponent,
        EntitySideBarComponent,
        ImageSideBarComponent,
        MapSideBarComponent,
        RuleSideBarComponent,
        BoardSideBarComponent,
        EntityWrapperComponent,
        SheetSideBarComponent,
        GenesisSheetsComponent,
        EditSheetComponent,
        SheetViewerComponent,
        DefinitionListConfigComponent,
        DefinitionChoiceConfigComponent,
        GenesisDefinitionsChartComponent,
        GenesisDefinitionsAddFormComponent,
        ShowRuleTableComponent,
        EditTableColumnComponent,
        PrimeDragulaDirective,
        //AceEditorComponent
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        //{provide: ErrorHandler, useClass: UntoldErrorHandler},
        { provide: RouteReuseStrategy, useClass: PreventErrorRouteReuseStrategy },
        WebApiService,
        TemplateConfigurationService,
        SignalRService,
        RealmHubSenderService,
        RealmHubListenerService,
        RealmDataService,
        UserDataService,
        FileDataService,
        TreeNodeService,
        GenesisDataService,
        NotificationDataService,
        NotificationTemplateService,
        GameService,
        GridService,
        GameWorkflowService,
        GameWorkflowRealmService,
        GameWorkflowMapService,
        GameWorkflowEntityService,
        GameWorkflowSheetService,
        VisibleAreaService,
        InteractionService,
        TokenService,
        RealmTableService,
        RealmDefinitionService,
        EntityService,
        SheetService,
        WallService,
        MapDataService,
        GrowlService,
        DomService,
        LoadQueueService,
        StorageDataService,
        TableStorageService,
        CsvFileService,
        WebWorkerService,
        AuthService,
        CalculatedExpressionService,
        ExpressionEvaluatorService,
        ExpressionOperatorService,
        ExpressionFunctionService,
        ExpressionTableCacheService,
        EntityEnhancerService,
        SheetEnhancerService,
        DefinitionEnhancerService,
        SheetEntityService,
        CanActivateSelectedRealmGuard,
        CanActivateSelectedRealmOwnerGuard,
        CanActivateAuthenticationGuard,
        DragulaService
    ],
    bootstrap:[AppComponent]
})
export class AppModule {
}
