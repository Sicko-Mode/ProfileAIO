import { Component, OnInit, Input } from '@angular/core';
import { ProxyService } from '../../../core/services/proxy.service';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../shared/models/user';
import { ProxyForm } from '../../../shared/models/proxy-form';
import { Observable } from 'rxjs/Observable';
import { _ } from 'underscore';

@Component({
  selector: 'app-proxy-form',
  templateUrl: './proxy-form.component.html',
  styleUrls: ['./proxy-form.component.css']
})
export class ProxyFormComponent implements OnInit {

  @Input() formType: string;

  private user: User = {};
  private proxyForm: ProxyForm = {};

  public regions$: Observable<String[]>;

  onSubmitloading = false;
  onDeleteLoading = false;

  constructor(
    private proxyService: ProxyService,
    private userService: UserService) { }

  ngOnInit() {
    this.getRegions();
    this.getUserSetting();
  }

  private getRegions(): void {
    this.regions$ = this.proxyService.getRegion(this.formType);
  }

  private getUserSetting(): void {
    this.userService.getUser()
      .subscribe(user => {
        if (!_.isEmpty(user)) {
          this.proxyForm.apiKey = user.linodeKey;
          this.proxyForm.proxyPassword = user.proxyPassword;
          this.proxyForm.proxyUsername = user.proxyUsername;
        }
      });
  }

  public onSubmit() {
    this.proxyService.createProxy(this.formType, this.proxyForm)
      .subscribe(data => console.log(data), err => console.log(err));
  }

  public onDeleteAll() {
    this.proxyService.deleteAll(this.formType, this.proxyForm)
      .subscribe(data => console.log(data), err => console.log(err));
  }
}
