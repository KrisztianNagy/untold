import {Component, Inject, forwardRef} from '@angular/core';
import {AppComponent} from './app.component';

import { AuthService } from './shared/services/auth.service';
import { ChatEntryService } from './store/services/chat-entry.service';

@Component({
    selector: 'app-topbar',
    template: `
        <div class="topbar clearfix">
            <div class="logo">
                <a href="#">
                    <img src="assets/layout/images/logo.png">
                </a>
            </div>

            <img src="assets/layout/images/untold.png" class="app-name"/>

            <a id="topbar-menu-button" href="#" (click)="app.onTopbarMenuButtonClick($event)">
                <i class="material-icons">menu</i>
            </a>

            <ul class="topbar-menu fadeInDown" [ngClass]="{'topbar-menu-visible': app.topbarMenuActive}">
                <li #profile class="profile-item" [ngClass]="{'active-topmenuitem':app.activeTopbarItem === profile}">
                    <a href="#" (click)="app.onTopbarItemClick($event,profile)">
                        <div class="profile-image">
                            <img [src]="authService.userProfile.picture">
                        </div>
                        <div class="profile-info">
                            <span class="topbar-item-name profile-name">{{authService.userProfile.name}}</span>
                        </div>
                    </a>

                    <ul class="fadeInDown">
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">person</i>
                                <span>Profile</span>
                                <span class="topbar-submenuitem-badge">5</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">security</i>
                                <span>Privacy</span>
                                <span class="topbar-submenuitem-badge">2</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">settings_applications</i>
                                <span>Settings</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#" (click)='logout()'>
                                <i class="material-icons">power_settings_new</i>
                                <span>Logout</span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li #settings [ngClass]="{'active-topmenuitem':app.activeTopbarItem === settings}">
                    <a href="#" (click)="app.onTopbarItemClick($event,settings)">
                        <i class="topbar-icon material-icons">settings</i>
                        <span class="topbar-item-name">Settings</span>
                    </a>
                    <ul class="fadeInDown">
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">palette</i>
                                <span>Change Theme</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">favorite_border</i>
                                <span>Favorites</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">lock</i>
                                <span>Lock Screen</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">wallpaper</i>
                                <span>Wallpaper</span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li #messages [ngClass]="{'active-topmenuitem':app.activeTopbarItem === messages}">
                    <a href="javascript:void(0)" (click)="app.onChatClick($event,messages)">
                        <i class="topbar-icon material-icons">message</i>
                        <span class="topbar-badge" *ngIf="chatCounter">{{chatCounter}}</span>
                        <span class="topbar-item-name">Messages</span>
                    </a>
                </li>
                <li #notifications [ngClass]="{'active-topmenuitem':app.activeTopbarItem === notifications}">
                    <a href="#" (click)="app.onTopbarItemClick($event,notifications)">
                        <i class="topbar-icon material-icons">timer</i>
                        <span class="topbar-badge">4</span>
                        <span class="topbar-item-name">Notifications</span>
                    </a>
                    <ul class="fadeInDown">
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">bug_report</i>
                                <span>Pending tasks</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">event</i>
                                <span>Meeting today at 3pm</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">file_download</i>
                                <span>Download documents</span>
                            </a>
                        </li>
                        <li role="menuitem">
                            <a href="#">
                                <i class="material-icons">flight</i>
                                <span>Book flight</span>
                            </a>
                        </li>
                    </ul>
                </li>
                <li #search class="search-item" [ngClass]="{'active-topmenuitem':app.activeTopbarItem === search}"
                    (click)="app.onTopbarItemClick($event,search)">
                    <span class="md-inputfield">
                        <input type="text" pInputText>
                        <label>Search</label>
                        <i class="topbar-icon material-icons">search</i>
                    </span>
                </li>
            </ul>
        </div>
    `
})
// tslint:disable-next-line:component-class-suffix
export class AppTopBar {
    chatCounter: number;

    constructor(@Inject(forwardRef(() => AppComponent)) public app: AppComponent,
                public authService: AuthService,
                private chatEntryService: ChatEntryService) {
        this.chatEntryService.chat.subscribe(entries => {
            this.chatCounter = entries.filter(entry => entry.isRead === false).length;
        });

    }

    logout() {
        this.authService.logout();
        window.location.href = '/';
    }
}
