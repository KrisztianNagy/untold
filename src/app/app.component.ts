import {
    Component, AfterViewInit, ElementRef, Renderer, ViewChild,
    ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, OnInit, NgZone
} from '@angular/core';
import { Router } from '@angular/router';

import { TemplateConfigurationService } from './store/services/template-configuration.service';
import { AuthService } from './shared/services/auth.service';
import { GameWorkflowService } from './shared/services/game-flow/game-workflow.service';
import { UserDataService } from './shared/services/rest/user-data.service';
import { Untold } from './shared/models/backend-export';
import { GrowlService } from './shared/services/growl.service';
enum MenuOrientation {
    STATIC,
    OVERLAY
}

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
    rippleInitListener: any;
    rippleMouseDownListener: any;
    chatVisible: boolean;

    constructor(private changeDetectorRef: ChangeDetectorRef,
        public renderer: Renderer,
        public zone: NgZone,
        private templateConfigurationService: TemplateConfigurationService,
        private userDataService: UserDataService,
        private authService: AuthService,
        private growlService: GrowlService,
        private gameWorkflowService: GameWorkflowService) {
        this.chatVisible = false;
        this.templateConfigurationService.update({
            showFrame: true
        });

        this.msgs = [];

        this.growlService.messageSubject.subscribe(msg => {
            this.msgs = [...this.msgs, msg];
        });
    }

    ngOnInit() {
        this.authService.ready.subscribe(() => {
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

    bindRipple() {
        this.rippleInitListener = this.init.bind(this);
        document.addEventListener('DOMContentLoaded', this.rippleInitListener);
      }

      init() {
        this.rippleMouseDownListener = this.rippleMouseDown.bind(this);
        document.addEventListener('mousedown', this.rippleMouseDownListener, false);
      }

      rippleMouseDown(e) {
        for (let target = e.target; target && target !== this; target = target['parentNode']) {
          if (!this.isVisible(target)) {
            continue;
          }

          // Element.matches() -> https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
          if (this.selectorMatches(target, '.ripplelink, .ui-button')) {
            const element = target;
            this.rippleEffect(element, e);
            break;
          }
        }
      }

      selectorMatches(el, selector) {
        const p = Element.prototype;
        const f = p['matches'] || p['webkitMatchesSelector'] || p['mozMatchesSelector'] || p['msMatchesSelector'] || function (s) {
          return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
        };
        return f.call(el, selector);
      }

      isVisible(el) {
        return !!(el.offsetWidth || el.offsetHeight);
      }

      rippleEffect(element, e) {
        if (element.querySelector('.ink') === null) {
          const inkEl = document.createElement('span');
          this.addClass(inkEl, 'ink');

          if (this.hasClass(element, 'ripplelink') && element.querySelector('span')) {
            element.querySelector('span').insertAdjacentHTML('afterend', '<span class=\'ink\'></span>');
          } else {
            element.appendChild(inkEl);
          }
        }

        const ink = element.querySelector('.ink');
        this.removeClass(ink, 'ripple-animate');

        if (!ink.offsetHeight && !ink.offsetWidth) {
          const d = Math.max(element.offsetWidth, element.offsetHeight);
          ink.style.height = d + 'px';
          ink.style.width = d + 'px';
        }

        const x = e.pageX - this.getOffset(element).left - (ink.offsetWidth / 2);
        const y = e.pageY - this.getOffset(element).top - (ink.offsetHeight / 2);

        ink.style.top = y + 'px';
        ink.style.left = x + 'px';
        ink.style.pointerEvents = 'none';
        this.addClass(ink, 'ripple-animate');
      }

      hasClass(element, className) {
        if (element.classList) {
          return element.classList.contains(className);
        } else {
          return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
      }

      addClass(element, className) {
        if (element.classList) {
          element.classList.add(className);
        } else {
          element.className += ' ' + className;
        }
      }

      removeClass(element, className) {
        if (element.classList) {
          element.classList.remove(className);
        } else {
          element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      }

      getOffset(el) {
        const rect = el.getBoundingClientRect();

        return {
          top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
          left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
        };
      }

      unbindRipple() {
        if (this.rippleInitListener) {
          document.removeEventListener('DOMContentLoaded', this.rippleInitListener);
        }
        if (this.rippleMouseDownListener) {
          document.removeEventListener('mousedown', this.rippleMouseDownListener);
        }
      }

      ngAfterViewInit() {
          this.documentClickListener = this.renderer.listen('body', 'click', (event) => {
              if (!this.topbarItemClick) {
                  this.activeTopbarItem = null;
                  this.topbarMenuActive = false;
              }

              if (!this.sidebarClick && (this.overlay || !this.isDesktop())) {
                  this.sidebarActive = false;
              }

              this.topbarItemClick = false;
              this.sidebarClick = false;
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
              this.activeTopbarItem = null; } else {
              this.activeTopbarItem = item; }

          event.preventDefault();
      }

      onTopbarSubItemClick(event) {
          event.preventDefault();
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

      isDesktop() {
          return window.innerWidth > 1024;
      }

      ngOnDestroy() {
          if (this.documentClickListener) {
              this.documentClickListener();
          }
          this.unbindRipple();
      }

      onChatClick($event, messages) {
        this.chatVisible = !this.chatVisible;
    }
}
