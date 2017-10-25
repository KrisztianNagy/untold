import {Component, AfterViewInit, ElementRef, Renderer, ViewChild,
        ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import { TemplateConfigurationService } from './store/services/template-configuration.service';
import { AuthService } from './shared/services/auth.service';
import { GameWorkflowService } from './shared/services/game-flow/game-workflow.service';
import { UserDataService } from './shared/services/rest/user-data.service';
import { Untold } from './shared/models/backend-export';
import { GrowlService } from './shared/services/growl.service';
import { Sidebar} from 'primeng/components/sidebar/sidebar';
enum MenuOrientation {
    STATIC,
    OVERLAY
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnDestroy, OnInit {
    authenticated: boolean;
    msgs: Array<any>;
    activeTabIndex: number;
    sidebarActive: boolean;
    layoutMode: MenuOrientation = MenuOrientation.STATIC;
    darkMenu = false;
    topbarMenuActive: boolean;
    sidebarClick: boolean;
    topbarItemClick: boolean;
    activeTopbarItem: any;
    documentClickListener: Function;
    chatVisible: boolean;

    constructor(private changeDetectorRef: ChangeDetectorRef,
                public renderer: Renderer,
                private el: ElementRef,
                private router: Router,
                private templateConfigurationService: TemplateConfigurationService,
                private gameWorkflowService: GameWorkflowService,
                private userDataService: UserDataService,
                private authService: AuthService,
                private growlService: GrowlService) {
        this.chatVisible = false;
        this.templateConfigurationService.update({
            showFrame: true
        });

        this.msgs = [];

        this.growlService.messageSubject.subscribe(msg => {
            this.msgs = [...this.msgs, msg];
        });
    }

    ngAfterViewInit() {
        this.documentClickListener = this.renderer.listenGlobal('body', 'click', (event) => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.sidebarClick && this.overlay) {
                this.sidebarActive = false;
            }

            this.topbarItemClick = false;
            this.sidebarClick = false;
        });
    }

    ngOnInit() {
        this.authService.ready.subscribe(() => {
            console.log('now');
            this.authenticated = this.authService.authenticated();
            if (!this.authenticated) {
                this.authService.login();
            } else {
                this.initScreenAfterAuth();
            }

            this.changeDetectorRef.markForCheck();
        });
    }

    initScreenAfterAuth() {
        const user: Untold.ClientUser = {
            id: 0,
            userName: '',
            displayName: (<any>this.authService.userProfile).name,
            email: (<any>this.authService.userProfile).email,
            picture: (<any>this.authService.userProfile).picture
        };

        this.userDataService.ensureUser(user).subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });
    }

    onTabClick(event: Event, index: number) {
        if (this.activeTabIndex === index) {
            this.sidebarActive = !this.sidebarActive;
        } else {
            this.activeTabIndex = index;
            this.sidebarActive = true;
        }

        event.preventDefault();
    }

    closeSidebar(event: Event) {
        this.sidebarActive = false;
        event.preventDefault();
    }

    onSidebarClick($event) {
        this.sidebarClick = true;
    }

    onTopbarMenuButtonClick(event) {
        this.topbarItemClick = true;
        this.topbarMenuActive = !this.topbarMenuActive;

        event.preventDefault();
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        } else {
            this.activeTopbarItem = item;
        }

        event.preventDefault();
    }

    onChatClick() {
        this.chatVisible = !this.chatVisible;
    }

    get overlay(): boolean {
        return this.layoutMode === MenuOrientation.OVERLAY;
    }

    changeToStaticMenu() {
        this.layoutMode = MenuOrientation.STATIC;
    }

    changeToOverlayMenu() {
        this.layoutMode = MenuOrientation.OVERLAY;
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
}
