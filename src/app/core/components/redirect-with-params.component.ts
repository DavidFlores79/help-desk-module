import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-redirect-with-params',
  standalone: true,
  template: ''
})
export class RedirectWithParamsComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const targetPath = this.route.snapshot.data['redirectTo'];
    const queryParams = this.route.snapshot.queryParams;

    this.router.navigate([targetPath], { queryParams });
  }
}
