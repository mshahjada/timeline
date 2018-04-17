import { environment } from '../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { AngularFireModule } from 'angularfire2';

import { HttpClient, HttpHeaders, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { DriverComponent } from './driver/driver.component';
import { TimelineComponent } from './timeline/timeline.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { CustomerComponent } from './customer/customer.component';
import { TimerDirective } from './directive/timer.directive';
import { TripDirective } from './directive/trip.directive';
import { TripdragDirective } from './directive/tripdrag.directive';
import { TripdropDirective } from './directive/tripdrop.directive';
import { TripModalComponent, TripModalContent } from './tripmodal/tripmodal.component';
import { AirMailComponent, AirMailContent } from './air-mail/air-mail.component';
import { MessageComponent } from './message/message.component';
import { DataService } from './service/data.service';
import { MessagingService } from './service/messaging.service';
import { FilterPipe } from './pipe/filter.pipe';
import { OrderByPipe } from './pipe/order-by.pipe';
import { OddEvenPipe } from './pipe/odd-even.pipe';
import { DragpanelDirective } from './directive/dragpanel.directive';
import { DroppanelDirective } from './directive/droppanel.directive';
import { TranslatePipe } from './translation/translate.pipe';
import { TranslationService } from './translation/translation.service';

// console.log(localeFr, registerLocaleData);
@NgModule({
  declarations: [
    AppComponent,
    DriverComponent,
    TimelineComponent,
    VehicleComponent,
    CustomerComponent,

    TimerDirective,
    TripDirective,
    TripdragDirective,
    TripdropDirective,
    
    TripModalComponent,
    TripModalContent,
    AirMailComponent,
    AirMailContent,
    MessageComponent,

    FilterPipe,
    OrderByPipe,
    OddEvenPipe,
    DragpanelDirective,
    DroppanelDirective,
    TranslatePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot(),
    HttpModule,
    HttpClientModule,
    //AngularFireModule.initializeApp(firebaseCofig)
  ],
  entryComponents:[TripModalContent, AirMailContent, MessageComponent],
  providers: [DataService, MessagingService, TranslationService],
  bootstrap: [AppComponent]
})
export class AppModule {
  
 }
