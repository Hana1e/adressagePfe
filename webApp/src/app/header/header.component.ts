import { Component, HostListener, Input, OnInit } from '@angular/core';
import { notifications, userItems } from './header-data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() collapsed=false;
  @Input() screenWidth=0;

  canShowSearchAsOverlay=false;

  notifications=notifications;
  userItems=userItems;

  constructor(){}

  
  @HostListener('window:resize' ,['$event'])
  onResize(event: any){
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  
  ngOnInit(): void {
    this.checkCanShowSearchAsOverlay(window.innerWidth);
  }

  getHeadClass():string{
    let styleClass='';
    if(this.collapsed && this.screenWidth > 768){
      styleClass='head-trimmed';
    } else {
      styleClass='head-md-screen';
    }
    return styleClass;
  }


  checkCanShowSearchAsOverlay(innerWidth:number):void{
    if(innerWidth < 845){
      this.canShowSearchAsOverlay=true;
    } else{
      this.canShowSearchAsOverlay=false;
    }
  }
}
