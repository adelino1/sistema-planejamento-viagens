import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { FavoritesRoutingModule } from './favorites-routing.module';
import { FavoriteListComponent } from './favorite-list/favorite-list.component';
import { FavoriteCardComponent } from './favorite-card/favorite-card.component';
import { FavoriteFormComponent } from './favorite-form/favorite-form.component';

@NgModule({
  declarations: [
    FavoriteListComponent,
    FavoriteCardComponent,
    FavoriteFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FavoritesRoutingModule,
  ],
  exports: [
    FavoriteListComponent,
    FavoriteCardComponent,
    FavoriteFormComponent,
  ],
})
export class FavoritesModule {}
